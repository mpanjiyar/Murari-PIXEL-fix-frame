/**
 * Exponential Backoff Retry Utility for Payment Submissions and Admin Approval Workflows.
 * 
 * Provides:
 * - Dynamic exponential backoff calculation with random jitter
 * - Full lifecycle tracing and telemetry logging
 * - Distinction between non-retryable client validation errors (400, 409) and retryable network/5xx server errors
 * - Progress callback for live UI countdowns and user feedback
 */

export interface RetryConfig {
  maxRetries?: number;        // Total attempts before giving up (default: 4)
  initialDelayMs?: number;    // First backoff delay in ms (default: 800)
  backoffFactor?: number;     // Multiplier for each subsequent retry (default: 2)
  maxDelayMs?: number;        // Maximum cap for backoff delay (default: 6000)
  timeoutMs?: number;         // Request timeout per attempt (default: 10000)
  jitter?: boolean;           // Add random jitter to avoid thundering herds (default: true)
  onRetry?: (attempt: number, maxRetries: number, delayMs: number, reason: string) => void;
  onAttemptStart?: (attempt: number, maxRetries: number) => void;
}

export interface SubmitPaymentPayload {
  orderId?: string;
  utrReference: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
}

export interface SubmitPaymentResult {
  success: boolean;
  order?: any;
  links?: {
    masterGoogleDrive?: string;
    directTokenDownload?: string;
  };
  message?: string;
  error?: string;
  attemptsUsed: number;
  totalTimeMs: number;
}

/**
 * Calculates exponential backoff delay with optional random jitter.
 */
export function calculateBackoff(
  attempt: number,
  initialDelayMs = 800,
  backoffFactor = 2,
  maxDelayMs = 6000,
  jitter = true
): number {
  const exponential = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
  const capped = Math.min(exponential, maxDelayMs);
  const jitterOffset = jitter ? Math.floor(Math.random() * 250) : 0;
  return capped + jitterOffset;
}

/**
 * Executes an HTTP fetch with timeout and exponential backoff retry.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  config: RetryConfig = {}
): Promise<{ res: Response; attemptsUsed: number }> {
  const maxRetries = config.maxRetries ?? 4;
  const initialDelay = config.initialDelayMs ?? 800;
  const backoffFactor = config.backoffFactor ?? 2;
  const maxDelay = config.maxDelayMs ?? 6000;
  const timeoutMs = config.timeoutMs ?? 10000;
  const jitter = config.jitter ?? true;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (config.onAttemptStart) {
      config.onAttemptStart(attempt, maxRetries);
    }

    console.log(
      `[API Lifecycle] Request to ${url} - Attempt ${attempt}/${maxRetries} starting...`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[API Lifecycle] Attempt ${attempt} timed out after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Non-retryable client validation/authentication conflicts:
      // 400 Bad Request (invalid phone, malformed UTR)
      // 401 Unauthorized / 403 Forbidden
      // 409 Conflict (e.g. duplicate UTR already claimed)
      // 422 Unprocessable Entity
      const isClientValidationError = [400, 401, 403, 409, 422].includes(res.status);

      if (isClientValidationError) {
        console.log(
          `[API Lifecycle] Definite client/validation response ${res.status} on attempt ${attempt}. Returning immediately without retry.`
        );
        return { res, attemptsUsed: attempt };
      }

      // If server returned 404 (endpoint temporarily unavailable/proxy glitch) or 5xx (server error):
      // These are server or routing glitches that must be retried with exponential backoff
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status} (${res.statusText || 'Endpoint unavailable'})`);
      }

      // Success 2xx
      console.log(`[API Lifecycle] Attempt ${attempt} succeeded with status ${res.status}`);
      return { res, attemptsUsed: attempt };
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      const isLastAttempt = attempt === maxRetries;
      const reason = err.name === 'AbortError' ? 'Request timed out' : err.message || 'Network communication error';

      console.warn(
        `[API Lifecycle] Attempt ${attempt}/${maxRetries} failed (${reason}).`
      );

      if (!isLastAttempt) {
        const delayMs = calculateBackoff(attempt, initialDelay, backoffFactor, maxDelay, jitter);
        console.log(`[API Lifecycle] Scheduling exponential backoff retry in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);

        if (config.onRetry) {
          config.onRetry(attempt, maxRetries, delayMs, reason);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Network communication error: Server was unreachable after multiple retry attempts.');
}

/**
 * Submits payment reference with full exponential backoff and structured response handling.
 */
export async function submitPaymentReferenceWithRetry(
  payload: SubmitPaymentPayload,
  config: RetryConfig = {}
): Promise<SubmitPaymentResult> {
  const startTime = Date.now();

  try {
    const { res, attemptsUsed } = await fetchWithRetry(
      '/api/reels/submit-payment-reference',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      config
    );

    const totalTimeMs = Date.now() - startTime;
    const text = await res.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        return {
          success: false,
          error: `Network communication error: Server returned unexpected non-JSON response (${res.status}). Please try again.`,
          attemptsUsed,
          totalTimeMs,
        };
      }
    }

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `Server error (${res.status})`,
        attemptsUsed,
        totalTimeMs,
      };
    }

    return {
      success: Boolean(data?.success),
      order: data?.order,
      links: data?.links,
      message: data?.message,
      error: data?.error,
      attemptsUsed,
      totalTimeMs,
    };
  } catch (err: any) {
    const totalTimeMs = Date.now() - startTime;
    const rawReason = err?.name === 'AbortError' ? 'Server connection timed out' : err?.message || 'Network communication error';
    const reason = rawReason.toLowerCase().includes('network') 
      ? rawReason 
      : `Network communication error: ${rawReason}`;

    return {
      success: false,
      error: reason,
      attemptsUsed: config.maxRetries ?? 4,
      totalTimeMs,
    };
  }
}
