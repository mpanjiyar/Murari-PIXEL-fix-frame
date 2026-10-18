import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AdminAlertNotification, AdminNotificationSeverity, AdminNotificationType } from '../types';

export interface ClientErrorContext {
  componentStack?: string;
  customTitle?: string;
  severity?: AdminNotificationSeverity;
  type?: AdminNotificationType;
  metadata?: Record<string, any>;
}

// In-memory throttling and deduplication state
const loggedFingerprints = new Map<string, { timestamp: number; count: number }>();
const MAX_ERRORS_PER_SESSION_WINDOW = 15;
const THROTTLE_WINDOW_MS = 60 * 1000; // 60 seconds per specific error
let sessionErrorCount = 0;
let sessionWindowStart = Date.now();
let isInitialized = false;

/**
 * Generates a consistent hash fingerprint for an error to prevent duplicate floods
 */
function createErrorFingerprint(name: string, message: string, url: string, line?: number, col?: number): string {
  const cleanUrl = url.split('?')[0] || 'local';
  const rawKey = `${name}::${message}::${cleanUrl}::${line || 0}:${col || 0}`;
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    hash = (hash << 5) - hash + rawKey.charCodeAt(i);
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

/**
 * Checks if the error is benign browser noise that should not trigger admin alerts
 */
function isIgnorableNoise(message: string, url?: string): boolean {
  if (!message) return true;
  const lowerMsg = message.toLowerCase();

  // ResizeObserver benign loop noise
  if (lowerMsg.includes('resizeobserver loop completed') || lowerMsg.includes('resizeobserver loop limit exceeded')) {
    return true;
  }

  // User canceled fetch/navigation
  if (lowerMsg.includes('aborterror') || lowerMsg.includes('the user aborted a request')) {
    return true;
  }

  // Browser extensions injection errors
  if (url && (url.startsWith('chrome-extension://') || url.startsWith('moz-extension://') || url.startsWith('safari-web-extension://'))) {
    return true;
  }

  // Harmless webpack/vite dev server HMR socket closure on refresh
  if (lowerMsg.includes('websocket closed') || lowerMsg.includes('vite:ws')) {
    return true;
  }

  return false;
}

/**
 * Core logging method: writes to Firestore 'admin_notifications' and dispatches to server for SSE
 */
export async function logClientError(
  error: unknown,
  context?: ClientErrorContext
): Promise<AdminAlertNotification | null> {
  try {
    // 1. Session Rate Limiter
    const now = Date.now();
    if (now - sessionWindowStart > 5 * 60 * 1000) {
      sessionWindowStart = now;
      sessionErrorCount = 0;
    }
    if (sessionErrorCount >= MAX_ERRORS_PER_SESSION_WINDOW) {
      console.warn('[ErrorLogger] Session error rate limit reached. Suppressing further notifications.');
      return null;
    }

    // 2. Extract error details
    let errorName = 'RuntimeError';
    let errorMessage = 'An unexpected client runtime exception occurred';
    let errorStack = '';
    let lineNumber: number | undefined;
    let colNumber: number | undefined;

    if (error instanceof Error) {
      errorName = error.name || 'Error';
      errorMessage = error.message || errorMessage;
      errorStack = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      const errObj = error as any;
      errorName = errObj.name || errorName;
      errorMessage = errObj.message || JSON.stringify(error);
      errorStack = errObj.stack || '';
      lineNumber = errObj.lineno;
      colNumber = errObj.colno;
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'unknown';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const screenDims = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown';

    // 3. Filter noise
    if (isIgnorableNoise(errorMessage, currentUrl)) {
      return null;
    }

    // 4. Deduplicate using fingerprint
    const fingerprint = createErrorFingerprint(errorName, errorMessage, currentUrl, lineNumber, colNumber);
    const existing = loggedFingerprints.get(fingerprint);
    if (existing && now - existing.timestamp < THROTTLE_WINDOW_MS) {
      existing.count += 1;
      return null;
    }
    loggedFingerprints.set(fingerprint, { timestamp: now, count: 1 });
    sessionErrorCount += 1;

    // 5. Build clean, strictly typed AdminAlertNotification payload
    const notifId = `ERR-${now.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const truncatedStack = errorStack ? errorStack.slice(0, 1800) : '';
    const truncatedCompStack = context?.componentStack ? context.componentStack.slice(0, 1000) : undefined;
    const severity: AdminNotificationSeverity = context?.severity || 'ERROR';
    const notifType: AdminNotificationType = context?.type || 'CLIENT_RUNTIME_ERROR';

    const shortMsg = errorMessage.length > 220 ? errorMessage.slice(0, 220) + '...' : errorMessage;
    const title = context?.customTitle || `Client Error: ${errorName} on ${typeof window !== 'undefined' ? window.location.pathname : '/'}`;

    const notificationPayload: AdminAlertNotification = {
      id: notifId,
      type: notifType,
      severity,
      title,
      message: `${shortMsg} (Device: ${screenDims})`,
      createdAt: new Date().toISOString(),
      eventFingerprint: fingerprint,
      url: currentUrl,
      errorName,
      stack: truncatedStack,
      componentStack: truncatedCompStack,
      userAgent,
      screen: screenDims,
      errorCount: 1,
      lastOccurredAt: new Date().toISOString(),
    };

    // 6. Direct write to Firestore 'admin_notifications' collection
    if (db) {
      try {
        await setDoc(doc(db, 'admin_notifications', notifId), notificationPayload);
        console.log(`[ErrorLogger] Logged client error to Firestore 'admin_notifications': ${notifId}`);
      } catch (fsErr) {
        console.warn('[ErrorLogger] Failed writing error to Firestore:', fsErr);
      }
    }

    // 7. Dual-write to backend endpoint for immediate SSE broadcast to active admin dashboards
    try {
      fetch('/api/reels/admin/log-client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification: notificationPayload }),
      }).catch(() => {});
    } catch (_) {}

    return notificationPayload;
  } catch (outerErr) {
    // Fail silently so error logger itself never crashes the application
    console.warn('[ErrorLogger] Internal failure in logger:', outerErr);
    return null;
  }
}

/**
 * Initializes global browser error listeners for uncaught exceptions and unhandled promise rejections
 */
export function initClientErrorLogger() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // 1. Uncaught global JavaScript runtime exceptions
  window.addEventListener('error', (event: ErrorEvent) => {
    // If error object is present, use it; otherwise construct from message/filename
    const err = event.error || new Error(event.message || 'Script execution error');
    logClientError(err, {
      customTitle: `Uncaught Exception in ${event.filename ? event.filename.split('/').pop() : 'script'}:${event.lineno || 0}`,
      severity: 'ERROR',
      type: 'CLIENT_RUNTIME_ERROR',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // 2. Unhandled asynchronous Promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const err = reason instanceof Error ? reason : new Error(typeof reason === 'string' ? reason : 'Unhandled Promise Rejection');
    logClientError(err, {
      customTitle: `Unhandled Promise Rejection: ${err.message ? err.message.slice(0, 60) : 'Async Error'}`,
      severity: 'WARNING',
      type: 'UNHANDLED_PROMISE_REJECTION',
    });
  });

  console.log('✓ Automated Real-Time Client Runtime Error Monitoring initialized (Firestore admin_notifications collection synced)');
}

/**
 * Helper to manually trigger a test client error for administrative verification
 */
export async function triggerTestClientError(): Promise<AdminAlertNotification | null> {
  const simulatedError = new Error(`Simulated test runtime exception for Murari Panjiyar real-time alert verification at ${new Date().toLocaleTimeString()}`);
  simulatedError.name = 'TestDiagnosticError';
  simulatedError.stack = `TestDiagnosticError: ${simulatedError.message}\n    at triggerTestClientError (clientErrorLogger.ts:195)\n    at AdminNotificationsPanel.tsx`;

  return await logClientError(simulatedError, {
    customTitle: '🧪 Diagnostic Test: Client Error Logging System',
    severity: 'INFO',
    type: 'CLIENT_RUNTIME_ERROR',
    componentStack: '    in AdminNotificationsPanel (created by App)\n    in App',
  });
}
