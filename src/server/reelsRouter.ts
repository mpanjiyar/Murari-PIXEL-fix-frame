import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  ReelPurchaseOrder,
  ReelOrderStatus,
  AdminAlertNotification,
  AdminNotificationType,
  AdminNotificationSeverity,
  MegaPackResource,
  ResourceAvailabilityStatus,
  OfferPopupConfig,
  DEFAULT_OFFER_POPUP_CONFIG
} from '../types';
import { INITIAL_MEGAPACK_RESOURCES } from '../data/initialMegaPackResources';

export interface StoreConfig {
  upiId: string;
  receiverName: string;
  productPrice: number;
  currency: string;
  campaignName: string;
  productName: string;
  headline: string;
  subtitle: string;
  badgeText: string;
  masterDriveLink: string;
  customQrUrl?: string;
  supportEmail: string;
  supportPhone: string;
  autoApprovalTestMode: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'vault_data');
const ORDERS_FILE = path.join(DATA_DIR, 'reels_orders.json');
const CONFIG_FILE = path.join(DATA_DIR, 'reels_config.json');
const POPUP_CONFIG_FILE = path.join(DATA_DIR, 'reels_offer_popup_config.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'admin_notifications.json');
const SUPPORT_FILE = path.join(DATA_DIR, 'reels_support.json');
const RESOURCES_FILE = path.join(DATA_DIR, 'reels_resources.json');

// Ensure storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Configuration - completely editable by admin
const DEFAULT_CONFIG: StoreConfig = {
  upiId: 'BHARATPE2J0A0P3W3B36214@unitype',
  receiverName: 'MURARI PANJIYAR',
  productPrice: 199.0,
  currency: 'INR',
  campaignName: 'Durga Puja Special Offer',
  productName: '150K+ MEGA PACK — REELS & SHORTS',
  headline: '150K+ MEGA PACK OF REELS & SHORTS',
  subtitle: 'Take your content creation to the next level with a massive collection of short-form videos for your creative projects.',
  badgeText: 'DURGA PUJA SPECIAL OFFER',
  masterDriveLink: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
  customQrUrl: '',
  supportEmail: 'Mpanjiyar100@gmail.com',
  supportPhone: '+91 86388 75231',
  autoApprovalTestMode: false, // Strict admin manual approval required
};

// In-memory caches backed by disk & Firestore
let ordersCache: Map<string, ReelPurchaseOrder> = new Map();
let notificationsCache: Map<string, AdminAlertNotification> = new Map();
let resourcesCache: Map<string, MegaPackResource> = new Map();
let storeConfig: StoreConfig = { ...DEFAULT_CONFIG };
let popupConfig: OfferPopupConfig = { ...DEFAULT_OFFER_POPUP_CONFIG };

// Helper: Persist resources to disk
function persistResources() {
  try {
    const list = Array.from(resourcesCache.values()).sort((a, b) => a.sortOrder - b.sortOrder);
    fs.writeFileSync(RESOURCES_FILE, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error('[Reels Store] Error saving resources:', err);
  }
}

// Helper: Persist popup config to disk
function persistPopupConfig() {
  try {
    fs.writeFileSync(POPUP_CONFIG_FILE, JSON.stringify(popupConfig, null, 2));
  } catch (err) {
    console.error('[Reels Store] Error saving popup config:', err);
  }
}

// Load resources from disk or seed
try {
  if (fs.existsSync(RESOURCES_FILE)) {
    const raw = fs.readFileSync(RESOURCES_FILE, 'utf-8');
    const arr: MegaPackResource[] = JSON.parse(raw);
    arr.forEach(r => resourcesCache.set(r.id, r));
  }
} catch (e) {
  console.warn('[Reels Store] Error loading resources, seeding defaults:', e);
}

if (resourcesCache.size === 0) {
  INITIAL_MEGAPACK_RESOURCES.forEach(r => resourcesCache.set(r.id, r));
  persistResources();
}

// Load config
try {
  if (fs.existsSync(CONFIG_FILE)) {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    storeConfig = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } else {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }
} catch (e) {
  console.warn('[Reels Store] Error loading config, using defaults:', e);
}

// Load offer popup config
try {
  if (fs.existsSync(POPUP_CONFIG_FILE)) {
    const raw = fs.readFileSync(POPUP_CONFIG_FILE, 'utf-8');
    popupConfig = { ...DEFAULT_OFFER_POPUP_CONFIG, ...JSON.parse(raw) };
  } else {
    fs.writeFileSync(POPUP_CONFIG_FILE, JSON.stringify(DEFAULT_OFFER_POPUP_CONFIG, null, 2));
  }
} catch (e) {
  console.warn('[Reels Store] Error loading popup config, using defaults:', e);
}

// Helper: Normalize order status
function normalizeStatus(status: string): ReelOrderStatus {
  const s = String(status || '').toUpperCase();
  if (s === 'PAID' || s === 'APPROVED') return 'APPROVED';
  if (s === 'AWAITING_MANUAL_VERIFICATION' || s === 'PENDING_ADMIN_REVIEW' || s === 'PENDING_VERIFICATION') return 'PENDING_ADMIN_REVIEW';
  if (s === 'REJECTED') return 'REJECTED';
  if (s === 'FAILED' || s === 'PAYMENT_FAILED') return 'PAYMENT_FAILED';
  if (s === 'REFUNDED') return 'REFUNDED';
  return 'PENDING_PAYMENT';
}

// Load orders
try {
  if (fs.existsSync(ORDERS_FILE)) {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const arr: any[] = JSON.parse(raw);
    arr.forEach(o => {
      const order: ReelPurchaseOrder = {
        ...o,
        status: normalizeStatus(o.status),
      };
      ordersCache.set(order.id, order);
    });
  }
} catch (e) {
  console.warn('[Reels Store] Error loading orders:', e);
}

// Load notifications
try {
  if (fs.existsSync(NOTIFICATIONS_FILE)) {
    const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    const arr: any[] = JSON.parse(raw);
    arr.forEach(n => {
      const normalized: AdminAlertNotification = {
        id: String(n.id),
        type: n.type || 'SYSTEM_INFO',
        severity: (n.severity ? String(n.severity).toUpperCase() : 'INFO') as any,
        title: n.title || 'Notification',
        message: n.message || '',
        relatedOrderId: n.relatedOrderId || n.referenceId || undefined,
        customerName: n.customerName || undefined,
        customerPhone: n.customerPhone || undefined,
        amount: typeof n.amount === 'number' ? n.amount : undefined,
        utrReference: n.utrReference || undefined,
        createdAt: n.createdAt || n.timestamp || new Date().toISOString(),
        readAt: n.readAt || (n.read ? (n.createdAt || n.timestamp || new Date().toISOString()) : null),
        resolvedAt: n.resolvedAt || null,
        eventFingerprint: n.eventFingerprint || undefined,
      };
      notificationsCache.set(normalized.id, normalized);
    });
  }
} catch (e) {
  console.warn('[Reels Store] Error loading notifications:', e);
}

// Seed initial orders and notifications if empty so Murari has realistic baseline data
if (ordersCache.size === 0) {
  const seedApproved: ReelPurchaseOrder = {
    id: 'RP-2026-A1098',
    productId: '150k-mega-reels-pack',
    productName: '150K+ MEGA PACK — REELS & SHORTS',
    campaign: 'Durga Puja Special Offer',
    amount: 199.0,
    currency: 'INR',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    status: 'APPROVED',
    paymentMethod: 'UPI_BHARATPE',
    upiId: storeConfig.upiId,
    receiverName: storeConfig.receiverName,
    utrReference: '428819034812',
    transactionId: 'TXN-PUJA-9921',
    verificationSource: 'manual_admin',
    submittedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    paymentVerifiedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reviewedByAdminId: 'Murari Panjiyar (Mpanjiyar100@gmail.com)',
    downloadToken: crypto.randomBytes(32).toString('hex'),
    downloadExpiresAt: Date.now() + 86400000 * 7,
    downloadCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    auditLogs: [
      {
        action: 'ORDER_CREATED',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        actor: 'CUSTOMER',
        details: 'Order initiated for ₹199 Durga Puja Special Offer',
      },
      {
        action: 'PAYMENT_REFERENCE_SUBMITTED',
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        actor: 'CUSTOMER',
        details: 'Customer submitted 12-Digit UTR: 428819034812',
      },
      {
        action: 'PAYMENT_APPROVED_BY_ADMIN',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        actor: 'Murari Panjiyar',
        details: 'Verified in BharatPe settlement records. Download entitlement unlocked.',
      },
    ],
  };

  const seedPending: ReelPurchaseOrder = {
    id: 'RP-2026-B4412',
    productId: '150k-mega-reels-pack',
    productName: '150K+ MEGA PACK — REELS & SHORTS',
    campaign: 'Durga Puja Special Offer',
    amount: 199.0,
    currency: 'INR',
    customerName: 'Priyanka Das',
    customerPhone: '+91 87654 32109',
    status: 'PENDING_ADMIN_REVIEW',
    paymentMethod: 'UPI_BHARATPE',
    upiId: storeConfig.upiId,
    receiverName: storeConfig.receiverName,
    utrReference: '428901237894',
    submittedAt: new Date(Date.now() - 1800000).toISOString(),
    downloadCount: 0,
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    auditLogs: [
      {
        action: 'ORDER_CREATED',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        actor: 'CUSTOMER',
        details: 'Order created for ₹199 INR via UPI',
      },
      {
        action: 'PAYMENT_REFERENCE_SUBMITTED',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        actor: 'CUSTOMER',
        details: 'Submitted 12-Digit UTR: 428901237894. Awaiting Murari approval.',
      },
    ],
  };

  ordersCache.set(seedApproved.id, seedApproved);
  ordersCache.set(seedPending.id, seedPending);
  persistOrders();

  // Create corresponding alert notification
  const seedNotif: AdminAlertNotification = {
    id: 'NOTIF-' + Date.now().toString(36).toUpperCase() + '-1',
    type: 'MANUAL_VERIFICATION_REQUEST',
    severity: 'INFO',
    title: 'New Manual UPI Payment Request (₹199)',
    message: 'Priyanka Das (+91 87654 32109) submitted 12-digit UTR 428901237894 for order RP-2026-B4412. Awaiting your approval.',
    relatedOrderId: seedPending.id,
    customerName: seedPending.customerName,
    customerPhone: seedPending.customerPhone,
    amount: 199.0,
    utrReference: seedPending.utrReference,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    readAt: null,
    resolvedAt: null,
  };
  notificationsCache.set(seedNotif.id, seedNotif);
  persistNotifications();
}

function persistOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(Array.from(ordersCache.values()), null, 2));
  } catch (err) {
    console.error('[Reels Store] Failed to persist orders to disk:', err);
  }
}

function persistConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(storeConfig, null, 2));
  } catch (err) {
    console.error('[Reels Store] Failed to persist config to disk:', err);
  }
}

function persistNotifications() {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(Array.from(notificationsCache.values()), null, 2));
  } catch (err) {
    console.error('[Reels Store] Failed to persist notifications to disk:', err);
  }
}

// Set of processed webhook IDs for idempotency
const processedWebhooks = new Set<string>();

// Payment webhook secret key
const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || 'durga_puja_reels_secret_2026';

// Synchronize order state to Firestore
export async function syncOrderToFirestore(order: ReelPurchaseOrder | any): Promise<void> {
  try {
    if (!db || !order || !order.id) return;
    const orderDocRef = doc(db, 'reels_orders', String(order.id));
    const nowIso = new Date().toISOString();
    const payload: Record<string, any> = {
      id: String(order.id),
      productId: order.productId || '150k-mega-reels-pack',
      productName: order.productName || '150K+ MEGA PACK — REELS & SHORTS',
      campaign: order.campaign || 'Durga Puja Special Offer',
      amount: typeof order.amount === 'number' ? order.amount : 199.0,
      currency: order.currency || 'INR',
      customerName: order.customerName || 'Customer',
      customerPhone: order.customerPhone || '',
      status: order.status || 'PENDING_PAYMENT',
      paymentMethod: order.paymentMethod || 'UPI_BHARATPE',
      upiId: order.upiId || storeConfig.upiId,
      receiverName: order.receiverName || storeConfig.receiverName,
      utrReference: order.utrReference || null,
      transactionId: order.transactionId || null,
      verificationSource: order.verificationSource || null,
      submittedAt: order.submittedAt || null,
      paymentVerifiedAt: order.paymentVerifiedAt || null,
      approvedAt: order.approvedAt || null,
      rejectedAt: order.rejectedAt || null,
      reviewedByAdminId: order.reviewedByAdminId || null,
      rejectionReason: order.rejectionReason || null,
      downloadToken: order.downloadToken || null,
      downloadExpiresAt: order.downloadExpiresAt || null,
      downloadCount: typeof order.downloadCount === 'number' ? order.downloadCount : 0,
      createdAt: order.createdAt || nowIso,
      updatedAt: order.updatedAt || nowIso,
      auditLogs: Array.isArray(order.auditLogs) ? order.auditLogs : [],
    };

    // Strip out any undefined values just in case
    for (const key of Object.keys(payload)) {
      if (payload[key] === undefined) {
        payload[key] = null;
      }
    }

    await setDoc(orderDocRef, payload, { merge: true });
  } catch (err) {
    console.warn(`[Reels Store] Firestore sync warning for ${order.id}:`, err);
  }
}

// Synchronize notification to Firestore
export async function syncNotificationToFirestore(notif: AdminAlertNotification | any): Promise<void> {
  try {
    if (!db || !notif || !notif.id) return;
    const notifDocRef = doc(db, 'admin_notifications', String(notif.id));
    const safeCreatedAt = notif.createdAt || notif.timestamp || new Date().toISOString();

    const payload: Record<string, any> = {
      id: String(notif.id),
      type: notif.type || 'SYSTEM_INFO',
      severity: notif.severity ? String(notif.severity).toUpperCase() : 'INFO',
      title: notif.title || 'Notification',
      message: notif.message || '',
      relatedOrderId: notif.relatedOrderId || notif.referenceId || null,
      customerName: notif.customerName || null,
      customerPhone: notif.customerPhone || null,
      amount: typeof notif.amount === 'number' ? notif.amount : null,
      utrReference: notif.utrReference || null,
      createdAt: safeCreatedAt,
      readAt: notif.readAt || (notif.read ? safeCreatedAt : null),
      resolvedAt: notif.resolvedAt || null,
      eventFingerprint: notif.eventFingerprint || null,
    };

    // Strip out any undefined values to strictly comply with Firestore setDoc constraints
    for (const key of Object.keys(payload)) {
      if (payload[key] === undefined) {
        payload[key] = null;
      }
    }

    await setDoc(notifDocRef, payload, { merge: true });
  } catch (err) {
    console.warn(`[Reels Store] Firestore notification sync warning:`, err);
  }
}

// Cryptographically verify payment webhook signature
export function verifyWebhookSignature(payloadRaw: string, signatureHeader?: string): boolean {
  if (!signatureHeader) return false;
  try {
    const cleanSig = signatureHeader.replace(/^sha256=/i, '').trim().toLowerCase();
    const computed = crypto.createHmac('sha256', PAYMENT_WEBHOOK_SECRET).update(payloadRaw).digest('hex').toLowerCase();
    const computedBuf = Buffer.from(computed, 'utf8');
    const headerBuf = Buffer.from(cleanSig, 'utf8');
    if (computedBuf.length !== headerBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, headerBuf);
  } catch {
    return false;
  }
}

// Generate unpredictable cryptographically secure Order ID
function generateOrderId(): string {
  const d = new Date();
  const datePrefix = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RP-${datePrefix}-${randomSuffix}`;
}

// ==========================================
// REAL-TIME SSE (Server-Sent Events) CONNECTION BUS
// ==========================================
interface SSEClient {
  id: string;
  res: Response;
  isAdmin: boolean;
  orderId?: string;
}

const activeSSEClients: Map<string, SSEClient> = new Map();

export function broadcastSSE(data: any, filter?: (client: SSEClient) => boolean) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const [clientId, client] of activeSSEClients.entries()) {
    try {
      if (!filter || filter(client)) {
        client.res.write(payload);
      }
    } catch {
      activeSSEClients.delete(clientId);
    }
  }
}

// Helper: Create admin notification
export function createAdminNotification(params: {
  type: AdminNotificationType;
  severity: AdminNotificationSeverity;
  title: string;
  message: string;
  relatedOrderId?: string;
  customerName?: string;
  customerPhone?: string;
  amount?: number;
  utrReference?: string;
}): AdminAlertNotification {
  const id = 'NOTIF-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
  const notif: AdminAlertNotification = {
    id,
    type: params.type,
    severity: params.severity,
    title: params.title,
    message: params.message,
    relatedOrderId: params.relatedOrderId,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    amount: params.amount,
    utrReference: params.utrReference,
    createdAt: new Date().toISOString(),
    readAt: null,
    resolvedAt: null,
  };

  notificationsCache.set(id, notif);
  persistNotifications();
  syncNotificationToFirestore(notif).catch(() => {});

  // Broadcast to all active admin sessions
  broadcastSSE(
    {
      eventType: 'NEW_NOTIFICATION',
      notification: notif,
      timestamp: notif.createdAt,
    },
    c => c.isAdmin
  );

  return notif;
}

export const reelsRouter = Router();

// ==========================================
// REAL-TIME SSE STREAM ENDPOINT
// ==========================================
reelsRouter.get('/events', (req: Request, res: Response) => {
  const clientId = 'SSE-' + Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex');
  const isAdmin = req.query.isAdmin === 'true';
  const orderId = typeof req.query.orderId === 'string' ? req.query.orderId : undefined;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send initial connection event with current config and resource registry
  res.write(`data: ${JSON.stringify({
    eventType: 'INITIAL_STATE',
    clientId,
    config: storeConfig,
    popupConfig,
    masterDriveLink: storeConfig.masterDriveLink,
    resources: Array.from(resourcesCache.values()).filter(r => isAdmin || r.isActive !== false),
    timestamp: new Date().toISOString()
  })}\n\n`);

  const client: SSEClient = { id: clientId, res, isAdmin, orderId };
  activeSSEClients.set(clientId, client);

  // Send periodic keepalive every 20 seconds
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(':keepalive\n\n');
    } catch {
      clearInterval(keepAliveInterval);
      activeSSEClients.delete(clientId);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    activeSSEClients.delete(clientId);
  });
});

// ==========================================
// 0. PUBLIC: Get Storefront Configuration
// Completely editable by admin (price, texts, link, UPI)
// ==========================================
reelsRouter.get('/config', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    config: {
      upiId: storeConfig.upiId,
      receiverName: storeConfig.receiverName,
      productPrice: storeConfig.productPrice,
      currency: storeConfig.currency,
      campaignName: storeConfig.campaignName,
      productName: storeConfig.productName,
      headline: storeConfig.headline,
      subtitle: storeConfig.subtitle,
      badgeText: storeConfig.badgeText,
      masterDriveLink: storeConfig.masterDriveLink,
      customQrUrl: storeConfig.customQrUrl || '',
      supportEmail: storeConfig.supportEmail,
      supportPhone: storeConfig.supportPhone,
      autoApprovalTestMode: storeConfig.autoApprovalTestMode,
    },
  });
});

// ==========================================
// 0B. PUBLIC & ADMIN: Get Offer Popup Configuration
// Completely editable by admin (logo, texts, links, prices, categories, trust badges)
// ==========================================
reelsRouter.get('/popup-config', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    config: popupConfig,
  });
});

// ==========================================
// 1. PUBLIC: Create Order (Name & Phone Required - NO Delivery Email)
// ==========================================
reelsRouter.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone } = req.body || {};

    // Validate customer name
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your full name to proceed with your order.',
      });
    }

    // Validate customer phone number (mandatory, must be at least 10 numeric digits)
    const cleanPhone = String(customerPhone || '').replace(/[^\d+]/g, '').trim();
    const rawDigits = cleanPhone.replace(/[^\d]/g, '');

    if (!cleanPhone || rawDigits.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile phone number for order verification.',
      });
    }

    const orderId = generateOrderId();
    const nowIso = new Date().toISOString();

    const amount = storeConfig.productPrice || 199.0;
    const currency = storeConfig.currency || 'INR';

    // Standard Indian UPI Intent URL
    const upiNote = encodeURIComponent(`${storeConfig.campaignName} ${orderId}`);
    const payeeName = encodeURIComponent(storeConfig.receiverName);
    const upiIntentUrl = `upi://pay?pa=${storeConfig.upiId}&pn=${payeeName}&am=${amount.toFixed(2)}&cu=${currency}&tn=${upiNote}`;

    const newOrder: ReelPurchaseOrder = {
      id: orderId,
      productId: '150k-mega-reels-pack',
      productName: storeConfig.productName || '150K+ MEGA PACK — REELS & SHORTS',
      campaign: storeConfig.campaignName || 'Durga Puja Special Offer',
      amount: amount,
      currency: currency,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      status: 'PENDING_PAYMENT',
      paymentMethod: 'UPI_BHARATPE',
      upiId: storeConfig.upiId,
      receiverName: storeConfig.receiverName,
      downloadCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      auditLogs: [
        {
          action: 'ORDER_CREATED',
          timestamp: nowIso,
          actor: 'CUSTOMER',
          details: `Order created for ₹${amount} INR. Customer: ${customerName.trim()} (${cleanPhone})`,
        },
      ],
    };

    ordersCache.set(orderId, newOrder);
    persistOrders();
    syncOrderToFirestore(newOrder).catch(() => {});

    // Broadcast order creation to admin
    broadcastSSE(
      {
        eventType: 'ORDER_CREATED',
        order: newOrder,
        timestamp: nowIso,
      },
      c => c.isAdmin
    );

    return res.status(201).json({
      success: true,
      order: {
        id: newOrder.id,
        productId: newOrder.productId,
        productName: newOrder.productName,
        campaign: newOrder.campaign,
        amount: newOrder.amount,
        currency: newOrder.currency,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
      },
      upi: {
        upiId: storeConfig.upiId,
        receiverName: storeConfig.receiverName,
        amount: amount,
        currency: currency,
        intentUrl: upiIntentUrl,
        customQrUrl: storeConfig.customQrUrl || null,
        note: `150K Reels Pack ${orderId}`,
      },
    });
  } catch (err: any) {
    console.error('[Reels Store] Create order error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error creating order.' });
  }
});

// ==========================================
// 2. PUBLIC: Check Order Status by Order ID
// Returns download access ONLY IF order is APPROVED by Murari
// ==========================================
reelsRouter.get('/order-status/:orderId', (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required.' });
    }

    const order = ordersCache.get(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // STRICT CHECK: Download access is ONLY unlocked if order is APPROVED
    const isApproved = order.status === 'APPROVED';

    return res.json({
      success: true,
      order: {
        id: order.id,
        productName: order.productName,
        amount: order.amount,
        currency: order.currency,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        utrReference: order.utrReference || null,
        submittedAt: order.submittedAt || null,
        approvedAt: order.approvedAt || null,
        rejectionReason: order.status === 'REJECTED' ? order.rejectionReason : undefined,
        downloadCount: order.downloadCount,
        // Only reveal downloadToken if explicitly APPROVED by admin Murari
        downloadToken: isApproved ? order.downloadToken : undefined,
        downloadExpiresAt: isApproved ? order.downloadExpiresAt : undefined,
      },
      approvalNotice:
        order.status === 'APPROVED'
          ? 'Your payment has been verified and your download access has been approved.'
          : order.status === 'PENDING_ADMIN_REVIEW'
          ? 'Payment verification is in progress. Download access will become available after administrator approval.'
          : order.status === 'REJECTED'
          ? `Verification failed: ${order.rejectionReason || 'UTR could not be reconciled. Please contact Murari Panjiyar.'}`
          : 'Please complete UPI payment and enter your 12-digit UTR to request administrator verification.',
      links: isApproved && order.downloadToken ? {
        masterGoogleDrive: storeConfig.masterDriveLink,
        directTokenDownload: `/api/reels/download/${order.downloadToken}?category=all`,
      } : undefined,
    });
  } catch (err: any) {
    console.error('[Reels Store] Get status error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error retrieving order status.' });
  }
});

// ==========================================
// 2B. PUBLIC: Order Lookup by Phone or Order ID
// Allows customers to track their approval status easily
// ==========================================
reelsRouter.post('/order-lookup', (req: Request, res: Response) => {
  try {
    const { query } = req.body || {};
    const cleanQuery = String(query || '').trim();

    if (!cleanQuery) {
      return res.status(400).json({ success: false, error: 'Please enter your Order ID or registered 10-digit Phone Number.' });
    }

    const digitsOnly = cleanQuery.replace(/[^\d]/g, '');

    // Search by order ID or phone
    const matches: ReelPurchaseOrder[] = [];
    for (const order of ordersCache.values()) {
      if (order.id.toLowerCase() === cleanQuery.toLowerCase()) {
        matches.push(order);
      } else if (digitsOnly.length >= 10 && order.customerPhone.replace(/[^\d]/g, '').includes(digitsOnly)) {
        matches.push(order);
      }
    }

    if (matches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No order found matching your inquiry. Please verify your 10-digit phone number or Order ID.',
      });
    }

    // Return newest matching order
    matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const order = matches[0];
    const isApproved = order.status === 'APPROVED';

    return res.json({
      success: true,
      order: {
        id: order.id,
        productName: order.productName,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        amount: order.amount,
        status: order.status,
        utrReference: order.utrReference || null,
        submittedAt: order.submittedAt || null,
        approvedAt: order.approvedAt || null,
        rejectionReason: order.status === 'REJECTED' ? order.rejectionReason : undefined,
        downloadToken: isApproved ? order.downloadToken : undefined,
      },
      links: isApproved && order.downloadToken ? {
        masterGoogleDrive: storeConfig.masterDriveLink,
        directTokenDownload: `/api/reels/download/${order.downloadToken}?category=all`,
      } : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Error looking up order.' });
  }
});

// ==========================================
// 3. PUBLIC: Submit 12-Digit UPI Payment Reference (UTR)
// STRICT WORKFLOW: Sets status to PENDING_ADMIN_REVIEW
// DOES NOT GRANT DOWNLOAD ACCESS UNTIL MURARI APPROVES!
// ==========================================
reelsRouter.post('/submit-payment-reference', async (req: Request, res: Response) => {
  try {
    let { orderId, utrReference, customerNotes, customerName, customerPhone } = req.body || {};

    const rawInput = String(utrReference || '').trim();
    // Strip common labels (e.g. "UTR:", "UPI Ref:", "Ref No:", "TXN:")
    const withoutPrefix = rawInput.replace(/^(utr|upi\s*ref(?:erence)?(?:\s*no)?|ref(?:\s*no)?|txn(?:\s*id)?|transaction\s*id)[:\s#-]*/i, '').trim();
    const cleanUtr = withoutPrefix.replace(/[\s-]+/g, '');

    // 1. Mandatory presence
    if (!cleanUtr) {
      return res.status(400).json({
        success: false,
        error: 'Please enter the 12-digit UPI Reference Number (UTR) from your payment receipt.',
      });
    }

    // 2. Strict numeric patterns: must consist purely of digits 0-9
    if (!/^\d+$/.test(cleanUtr)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI Transaction Reference. The UTR must contain numeric digits (0-9) only. Alphabetic letters and special characters are not allowed.',
      });
    }

    // 3. Strict 12-digit length requirement
    if (cleanUtr.length !== 12) {
      return res.status(400).json({
        success: false,
        error: `Invalid UTR length. A genuine UPI Reference Number must be exactly 12 numeric digits (you entered ${cleanUtr.length} digits). Example: 428819034812.`,
      });
    }

    // 4. Pattern check: Reject repeated identical digits (e.g. 000000000000, 111111111111)
    if (/^(\d)\1{11}$/.test(cleanUtr)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI Reference Number. Repetitive dummy digits (e.g., all identical numbers) are rejected.',
      });
    }

    // 5. Pattern check: Reject trivial sequential numbers
    const dummySequences = ['123456789012', '012345678901', '987654321098', '123456789123', '000000000001', '012345678910', '998877665544'];
    if (dummySequences.includes(cleanUtr)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI Reference Number. Trivial sequential numbers are not accepted.',
      });
    }

    // 6. Pattern check: Reject triple zero beginnings not used by NPCI banking rails
    if (cleanUtr.startsWith('000')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI Reference Number. Legitimate banking transaction references do not begin with 000.',
      });
    }

    const nowIso = new Date().toISOString();
    let order: ReelPurchaseOrder | undefined;

    if (orderId && typeof orderId === 'string') {
      order = ordersCache.get(orderId);
    }

    // Seamless resilience: If order does not exist or expired in session, auto-create it now
    if (!order) {
      const generatedId = orderId && String(orderId).startsWith('RP-') ? orderId : generateOrderId();
      const phone = String(customerPhone || '').replace(/[^\d+]/g, '').trim();
      order = {
        id: generatedId,
        productId: '150k-mega-reels-pack',
        productName: storeConfig.productName || '150K+ MEGA PACK — REELS & SHORTS',
        campaign: storeConfig.campaignName || 'Durga Puja Special Offer',
        amount: storeConfig.productPrice || 199.0,
        currency: storeConfig.currency || 'INR',
        customerName: (customerName || 'Valued Creator').trim(),
        customerPhone: phone || '+91 98765 00000',
        status: 'PENDING_PAYMENT',
        paymentMethod: 'UPI_BHARATPE',
        upiId: storeConfig.upiId,
        receiverName: storeConfig.receiverName,
        downloadCount: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
        auditLogs: [
          {
            action: 'ORDER_INITIATED_VIA_UTR',
            timestamp: nowIso,
            actor: 'CUSTOMER',
            details: `Auto-generated order for UTR submission ${cleanUtr}`,
          },
        ],
      };
      ordersCache.set(order.id, order);
    }

    // If order is already APPROVED, return approved state
    if (order.status === 'APPROVED' && order.downloadToken) {
      return res.json({
        success: true,
        message: 'Your payment has been verified and your download access has been approved.',
        order: {
          id: order.id,
          status: 'APPROVED',
          downloadToken: order.downloadToken,
          downloadExpiresAt: order.downloadExpiresAt,
          utrReference: order.utrReference,
        },
        links: {
          masterGoogleDrive: storeConfig.masterDriveLink,
          directTokenDownload: `/api/reels/download/${order.downloadToken}?category=all`,
        },
      });
    }

    // Prevent duplicate UTR replay across distinct already APPROVED orders
    for (const [existingId, existingOrder] of ordersCache.entries()) {
      if (existingId !== order.id && existingOrder.utrReference === cleanUtr && existingOrder.status === 'APPROVED') {
        // Generate security warning for Murari
        createAdminNotification({
          type: 'SYSTEM_WARNING',
          severity: 'WARNING',
          title: 'Duplicate UTR Submission Attempted',
          message: `Attempted replay of already approved UTR ${cleanUtr} on order ${order.id} by ${customerName || order.customerName} (${customerPhone || order.customerPhone}).`,
          relatedOrderId: order.id,
          utrReference: cleanUtr,
        });

        return res.status(409).json({
          success: false,
          error: 'This 12-digit UPI reference number has already been claimed by another verified purchase. Transaction reuse is strictly rejected.',
        });
      }
    }

    // Update customer info if provided
    if (customerName && typeof customerName === 'string' && customerName.trim().length >= 2) {
      order.customerName = customerName.trim();
    }
    if (customerPhone) {
      order.customerPhone = String(customerPhone).replace(/[^\d+]/g, '').trim();
    }

    // STRICT BUSINESS RULE:
    // Status MUST be set to PENDING_ADMIN_REVIEW.
    // Download access is NOT granted until Murari Panjiyar approves!
    order.status = 'PENDING_ADMIN_REVIEW';
    order.utrReference = cleanUtr;
    order.customerNotes = (customerNotes || '').trim();
    order.submittedAt = nowIso;
    order.updatedAt = nowIso;
    order.auditLogs.push({
      action: 'PAYMENT_REFERENCE_SUBMITTED',
      timestamp: nowIso,
      actor: 'CUSTOMER_UTR_SUBMISSION',
      details: `12-Digit UPI Reference submitted (${cleanUtr}). Awaiting manual admin approval.`,
    });

    ordersCache.set(order.id, order);
    persistOrders();
    await syncOrderToFirestore(order);

    // Create real-time admin alert notification for Murari
    const notif = createAdminNotification({
      type: 'MANUAL_VERIFICATION_REQUEST',
      severity: 'INFO',
      title: 'New Manual UPI Payment Verification Request',
      message: `Murari, order ${order.id} from ${order.customerName} (${order.customerPhone}) has submitted UTR ${cleanUtr} for ₹199. Please verify BharatPe statement and approve.`,
      relatedOrderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      amount: order.amount,
      utrReference: cleanUtr,
    });

    // Broadcast status change to connected customer and admin sessions
    broadcastSSE({
      eventType: 'ORDER_SUBMITTED_FOR_REVIEW',
      orderId: order.id,
      status: order.status,
      customerName: order.customerName,
      utrReference: cleanUtr,
      timestamp: nowIso,
    });

    return res.json({
      success: true,
      message: 'Your payment details have been submitted successfully. Your order is awaiting administrator verification. You will receive download access on this website after approval.',
      order: {
        id: order.id,
        status: order.status,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        amount: order.amount,
        utrReference: order.utrReference,
        submittedAt: order.submittedAt,
      },
      // DO NOT return links or downloadToken at this stage! Access is locked!
    });
  } catch (err: any) {
    console.error('[Reels Store] Submit reference error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error submitting payment reference.' });
  }
});

// ==========================================
// 4. ADMIN: Real-Time Notifications API
// ==========================================
reelsRouter.get('/admin/notifications', (_req: Request, res: Response) => {
  try {
    const notifications = Array.from(notificationsCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const unreadCount = notifications.filter(n => !n.readAt).length;

    return res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Error fetching notifications' });
  }
});

reelsRouter.post('/admin/notifications/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notif = notificationsCache.get(id);
    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    notif.readAt = new Date().toISOString();
    notificationsCache.set(id, notif);
    persistNotifications();
    syncNotificationToFirestore(notif).catch(() => {});

    broadcastSSE(
      { eventType: 'NOTIFICATION_READ', id },
      c => c.isAdmin
    );

    return res.json({ success: true, notification: notif });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Error marking notification read' });
  }
});

reelsRouter.post('/admin/notifications/mark-all-read', (_req: Request, res: Response) => {
  try {
    const nowIso = new Date().toISOString();
    for (const notif of notificationsCache.values()) {
      if (!notif.readAt) {
        notif.readAt = nowIso;
        syncNotificationToFirestore(notif).catch(() => {});
      }
    }
    persistNotifications();

    broadcastSSE(
      { eventType: 'NOTIFICATIONS_ALL_READ', timestamp: nowIso },
      c => c.isAdmin
    );

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Error marking all notifications read' });
  }
});

// ==========================================
// 5. ADMIN: List All Purchases & Summary KPI Stats
// Verified Revenue ONLY counts APPROVED purchases!
// ==========================================
reelsRouter.get('/admin/orders', (_req: Request, res: Response) => {
  try {
    const orders = Array.from(ordersCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalOrders = orders.length;
    const approvedOrders = orders.filter(o => o.status === 'APPROVED').length;
    const pendingReview = orders.filter(o => o.status === 'PENDING_ADMIN_REVIEW').length;
    const pendingPayment = orders.filter(o => o.status === 'PENDING_PAYMENT').length;
    const rejectedOrders = orders.filter(o => o.status === 'REJECTED').length;
    const failedOrders = orders.filter(o => o.status === 'PAYMENT_FAILED').length;
    const refundedOrders = orders.filter(o => o.status === 'REFUNDED').length;

    // Strict Accounting: Revenue ONLY counts confirmed APPROVED purchases
    const verifiedRevenue = orders
      .filter(o => o.status === 'APPROVED')
      .reduce((sum, o) => sum + (o.amount || 199.0), 0);

    return res.json({
      success: true,
      stats: {
        totalOrders,
        approvedOrders,
        pendingReview,
        pendingPayment,
        rejectedOrders,
        failedOrders,
        refundedOrders,
        verifiedRevenue,
        approvalRate: totalOrders > 0 ? ((approvedOrders / totalOrders) * 100).toFixed(1) + '%' : '0%',
      },
      orders,
    });
  } catch (err: any) {
    console.error('[Reels Store Admin] Get orders error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error fetching admin orders.' });
  }
});

// ==========================================
// 6. ADMIN: Manual Verify Order (Approve / Reject with Reason)
// THIS IS THE BUSINESS GATEWAY THAT UNLOCKS ACCESS!
// ==========================================
reelsRouter.post('/admin/verify-order', async (req: Request, res: Response) => {
  try {
    const { orderId, action, reason, adminName, adminEmail } = req.body || {};

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, error: 'Order ID is required.' });
    }

    const order = ordersCache.get(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const nowIso = new Date().toISOString();
    const adminIdentifier = adminEmail ? `${adminName || 'Murari Panjiyar'} (${adminEmail})` : 'Murari Panjiyar (Mpanjiyar100@gmail.com)';

    if (action === 'approve') {
      // 1. Generate high-entropy 32-byte cryptographic download token
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 86400000 * 7; // 7 days rolling validity

      order.status = 'APPROVED';
      order.verificationSource = 'manual_admin';
      order.paymentVerifiedAt = nowIso;
      order.approvedAt = nowIso;
      order.reviewedByAdminId = adminIdentifier;
      order.downloadToken = downloadToken;
      order.downloadExpiresAt = expiresAt;
      order.updatedAt = nowIso;
      order.auditLogs.push({
        action: 'PAYMENT_APPROVED_BY_ADMIN',
        timestamp: nowIso,
        actor: adminIdentifier,
        details: reason || 'Verified against BharatPe settlement statement. Access granted.',
      });

      ordersCache.set(orderId, order);
      persistOrders();
      await syncOrderToFirestore(order);

      // Resolve related notification
      for (const notif of notificationsCache.values()) {
        if (notif.relatedOrderId === orderId && notif.type === 'MANUAL_VERIFICATION_REQUEST') {
          notif.readAt = nowIso;
          notif.resolvedAt = nowIso;
          syncNotificationToFirestore(notif).catch(() => {});
        }
      }
      persistNotifications();

      // BROADCAST REAL-TIME EVENT VIA SSE TO UNLOCK BUYER SCREEN IMMEDIATELY!
      broadcastSSE({
        eventType: 'ORDER_APPROVED',
        orderId: order.id,
        status: 'APPROVED',
        downloadToken: order.downloadToken,
        downloadExpiresAt: order.downloadExpiresAt,
        masterDriveLink: storeConfig.masterDriveLink,
        timestamp: nowIso,
      });

      return res.json({
        success: true,
        message: `Order ${orderId} has been successfully verified & approved by Murari Panjiyar. Google Drive access unlocked for customer!`,
        order,
      });
    } else if (action === 'reject') {
      if (!reason || !String(reason).trim()) {
        return res.status(400).json({ success: false, error: 'A specific rejection reason is required to notify the customer.' });
      }

      order.status = 'REJECTED';
      order.rejectedAt = nowIso;
      order.reviewedByAdminId = adminIdentifier;
      order.rejectionReason = String(reason).trim();
      order.downloadToken = undefined;
      order.downloadExpiresAt = undefined;
      order.updatedAt = nowIso;
      order.auditLogs.push({
        action: 'PAYMENT_REJECTED_BY_ADMIN',
        timestamp: nowIso,
        actor: adminIdentifier,
        details: `Reason: ${reason.trim()}`,
      });

      ordersCache.set(orderId, order);
      persistOrders();
      await syncOrderToFirestore(order);

      // Resolve related notification
      for (const notif of notificationsCache.values()) {
        if (notif.relatedOrderId === orderId && notif.type === 'MANUAL_VERIFICATION_REQUEST') {
          notif.readAt = nowIso;
          notif.resolvedAt = nowIso;
          syncNotificationToFirestore(notif).catch(() => {});
        }
      }
      persistNotifications();

      // Broadcast rejection event to buyer's screen
      broadcastSSE({
        eventType: 'ORDER_REJECTED',
        orderId: order.id,
        status: 'REJECTED',
        rejectionReason: order.rejectionReason,
        timestamp: nowIso,
      });

      return res.json({
        success: true,
        message: `Order ${orderId} marked as rejected. Customer will be notified with reason.`,
        order,
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action. Must be "approve" or "reject".' });
    }
  } catch (err: any) {
    console.error('[Reels Store Admin] Verify error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error updating order.' });
  }
});

// ==========================================
// 7. ADMIN: Export Purchases to CSV
// ==========================================
reelsRouter.get('/admin/export-csv', (_req: Request, res: Response) => {
  try {
    const orders = Array.from(ordersCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const headers = [
      'Order ID',
      'Customer Name',
      'Phone Number',
      'Product',
      'Amount (INR)',
      'UPI ID',
      'Payment Reference (UTR)',
      'Status',
      'Created At',
      'Submitted At',
      'Approved At',
      'Reviewed By',
      'Rejection Reason',
      'Download Count',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = orders.map(o => [
      escapeCsv(o.id),
      escapeCsv(o.customerName),
      escapeCsv(o.customerPhone),
      escapeCsv(o.productName),
      escapeCsv(o.amount),
      escapeCsv(o.upiId),
      escapeCsv(o.utrReference || 'N/A'),
      escapeCsv(o.status),
      escapeCsv(o.createdAt),
      escapeCsv(o.submittedAt || 'N/A'),
      escapeCsv(o.approvedAt || 'N/A'),
      escapeCsv(o.reviewedByAdminId || 'N/A'),
      escapeCsv(o.rejectionReason || 'N/A'),
      escapeCsv(o.downloadCount || 0),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="reels_purchases_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (err: any) {
    console.error('[Reels Store] CSV Export error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate CSV export.' });
  }
});

// ==========================================
// 8. SECURE WEBHOOK: Payment Provider Webhook Handler
// ==========================================
async function handlePaymentWebhook(req: Request, res: Response) {
  try {
    const rawPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const signature = (
      req.headers['x-webhook-signature'] ||
      req.headers['x-razorpay-signature'] ||
      req.headers['x-bharatpe-signature'] ||
      req.headers['x-signature'] ||
      req.headers['x-hub-signature-256'] ||
      ''
    ) as string;

    const isTestBypass = req.headers['x-test-webhook'] === 'true' && process.env.NODE_ENV !== 'production';

    // Verify cryptographic signature
    if (!isTestBypass && !verifyWebhookSignature(rawPayload, signature)) {
      console.warn('[Reels Webhook] Rejected webhook with invalid signature');
      // Alert Murari about suspicious or failed webhook attempt
      createAdminNotification({
        type: 'FAILED_WEBHOOK',
        severity: 'WARNING',
        title: 'Payment Webhook Signature Failed',
        message: `An incoming webhook from IP ${req.ip} failed HMAC cryptographic signature verification. Event was safely rejected.`,
      });

      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or missing cryptographic webhook signature.',
      });
    }

    const payload = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(rawPayload || '{}');
    const eventId = String(
      payload.id ||
      payload.event_id ||
      payload.payment_id ||
      payload.transactionId ||
      payload.utr ||
      payload?.payload?.payment?.entity?.id ||
      ''
    );

    // Idempotency: Reject duplicate/replayed webhook events
    if (eventId && processedWebhooks.has(eventId)) {
      return res.status(200).json({
        success: true,
        message: 'Webhook event already processed (idempotent)',
        eventId,
      });
    }

    // Verify amount is exactly ₹199 INR
    let amountReceived = 199.0;
    if (payload.amount !== undefined) {
      const rawNum = Number(payload.amount);
      amountReceived = rawNum >= 1000 ? rawNum / 100 : rawNum;
    } else if (payload?.payload?.payment?.entity?.amount !== undefined) {
      const rawNum = Number(payload.payload.payment.entity.amount);
      amountReceived = rawNum >= 1000 ? rawNum / 100 : rawNum;
    }

    if (Math.round(amountReceived) !== 199) {
      createAdminNotification({
        type: 'FAILED_WEBHOOK',
        severity: 'ERROR',
        title: 'Webhook Amount Mismatch Warning',
        message: `Incoming webhook reported ₹${amountReceived} INR instead of required ₹199. Order verification halted.`,
      });

      return res.status(400).json({
        success: false,
        error: `Transaction amount mismatch: Expected ₹199 INR, got ₹${amountReceived}`,
      });
    }

    const orderId = String(
      payload.orderId ||
      payload.order_id ||
      payload.notes?.orderId ||
      payload?.payload?.payment?.entity?.notes?.orderId ||
      ''
    );

    let targetOrder: ReelPurchaseOrder | undefined;
    if (orderId) {
      targetOrder = ordersCache.get(orderId);
    }

    const nowIso = new Date().toISOString();
    if (!targetOrder) {
      const newId = orderId && orderId.startsWith('RP-') ? orderId : generateOrderId();
      targetOrder = {
        id: newId,
        productId: '150k-mega-reels-pack',
        productName: '150K+ MEGA PACK — REELS & SHORTS',
        campaign: storeConfig.campaignName,
        amount: 199.0,
        currency: 'INR',
        customerName: (payload.customerName || 'Valued Creator').trim(),
        customerPhone: (payload.customerPhone || payload?.payload?.payment?.entity?.contact || '+91 98765 00000').trim(),
        status: 'APPROVED',
        paymentMethod: 'UPI_BHARATPE',
        upiId: storeConfig.upiId,
        receiverName: storeConfig.receiverName,
        downloadCount: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
        auditLogs: [],
      };
      ordersCache.set(newId, targetOrder);
    }

    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 86400000 * 7;

    targetOrder.status = 'APPROVED';
    targetOrder.verificationSource = 'merchant_webhook';
    targetOrder.paymentVerifiedAt = nowIso;
    targetOrder.approvedAt = nowIso;
    targetOrder.reviewedByAdminId = 'PAYMENT_WEBHOOK_GATEWAY';
    targetOrder.transactionId = eventId || `TXN-WB-${Date.now().toString(36).toUpperCase()}`;
    targetOrder.utrReference = payload.utr || payload.rrn || payload.bank_reference || targetOrder.utrReference || 'WEBHOOK-VERIFIED';
    targetOrder.downloadToken = downloadToken;
    targetOrder.downloadExpiresAt = expiresAt;
    targetOrder.updatedAt = nowIso;
    targetOrder.auditLogs.push({
      action: 'PAYMENT_VERIFIED_WEBHOOK',
      timestamp: nowIso,
      actor: 'PAYMENT_GATEWAY',
      details: `Signature valid. Amount ₹${amountReceived} INR verified. Order APPROVED.`,
    });

    ordersCache.set(targetOrder.id, targetOrder);
    persistOrders();
    await syncOrderToFirestore(targetOrder);

    if (eventId) {
      processedWebhooks.add(eventId);
    }

    broadcastSSE({
      eventType: 'ORDER_APPROVED',
      orderId: targetOrder.id,
      status: 'APPROVED',
      downloadToken: targetOrder.downloadToken,
      masterDriveLink: storeConfig.masterDriveLink,
      timestamp: nowIso,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and entitlement created successfully',
      orderId: targetOrder.id,
      status: targetOrder.status,
    });
  } catch (err: any) {
    console.error('[Reels Webhook] Internal processing error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing webhook.' });
  }
}

reelsRouter.post('/webhook', handlePaymentWebhook);
reelsRouter.post('/payment-webhook', handlePaymentWebhook);

// ==========================================
// 9. PROTECTED: Category Download Handler (Token & Approval Authenticated)
// ==========================================
const CATEGORY_DOWNLOAD_MANIFEST: Record<string, {
  name: string;
  itemCount: string;
  sizeGb: string;
  directVaultUrl: string;
  notes: string;
}> = {
  all: {
    name: '150K+ Master Reel Vault (Complete Collection)',
    itemCount: '150,000+ Raw Shorts',
    sizeGb: '42.5 GB Total',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'Access to organized Google Drive folders with 1080x1920 9:16 vertical MP4s without watermarks.',
  },
  anime: {
    name: 'Anime Mega Pack',
    itemCount: '20,000+ Clips',
    sizeGb: '5.8 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'High-octane action scenes, lo-fi aesthetic edits, cyberpunk neo-Tokyo, shonen clips.',
  },
  cartoons: {
    name: 'Cartoons & Animation Classics Pack',
    itemCount: '18,000+ Clips',
    sizeGb: '4.6 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'Nostalgic 90s/2000s classics, viral cuts, comedy shorts with viral retention.',
  },
  motivation: {
    name: 'Motivation & Mindset Pack',
    itemCount: '25,000+ Clips',
    sizeGb: '7.2 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'Gym aesthetics, billionaire discipline, luxury lifestyle, stoic speech reels.',
  },
  woodworking: {
    name: 'Artisan Woodworking & Craft Pack',
    itemCount: '14,000+ Clips',
    sizeGb: '4.1 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'Japanese timber joinery, resin art, chisel carving, and satisfying timber restoration.',
  },
  satisfying: {
    name: 'Satisfying & ASMR Loops Pack',
    itemCount: '16,000+ Clips',
    sizeGb: '4.9 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'Kinetic sand slicing, hydraulic press, hypnotic paint mixing, pottery, and ASMR.',
  },
  animation3d: {
    name: '3D Animation & Design Pack',
    itemCount: '15,000+ Clips',
    sizeGb: '4.8 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'Surreal Blender simulations, fluid dynamics, futuristic sci-fi cityscapes, physics loops.',
  },
  cars: {
    name: 'Cars & Automotive Pack',
    itemCount: '18,000+ Clips',
    sizeGb: '5.4 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'Hypercars, JDM drifts, exhaust sounds, track days, and aesthetic night rolls.',
  },
  travel: {
    name: 'Travel & Nature Pack',
    itemCount: '16,000+ Clips',
    sizeGb: '5.1 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: '4K drone landscapes, aurora borealis, alpine peaks, beaches, and wanderlust reels.',
  },
  other: {
    name: 'Bonus Pack (Food, Gym & Tech)',
    itemCount: '12,000+ Clips',
    sizeGb: '3.6 GB',
    directVaultUrl: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
    notes: 'Street food, calisthenics drills, tech gadgets, luxury watches, and audio loops.',
  },
};

reelsRouter.get('/download/:token/:category?', (req: Request, res: Response) => {
  try {
    const { token, category } = req.params;
    if (!token || typeof token !== 'string' || token.length < 16) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Missing or invalid download authorization token.',
      });
    }

    let matchingOrder: ReelPurchaseOrder | null = null;
    for (const order of ordersCache.values()) {
      if (order.downloadToken === token) {
        matchingOrder = order;
        break;
      }
    }

    if (!matchingOrder) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Download token does not correspond to an authorized purchase.',
      });
    }

    // STRICT CHECK: Order must be APPROVED by Murari Panjiyar
    if (matchingOrder.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Payment has not been approved by administrator Murari Panjiyar.',
      });
    }

    // Check expiration (7 days rolling)
    if (matchingOrder.downloadExpiresAt && Date.now() > matchingOrder.downloadExpiresAt) {
      return res.status(403).json({
        success: false,
        error: 'Download authorization expired. Please check your order status to refresh your link.',
      });
    }

    // Rate-limiting check
    if (matchingOrder.downloadCount > 150) {
      return res.status(429).json({
        success: false,
        error: 'Download quota exceeded. Please contact Murari for support.',
      });
    }

    matchingOrder.downloadCount = (matchingOrder.downloadCount || 0) + 1;
    matchingOrder.updatedAt = new Date().toISOString();
    matchingOrder.auditLogs.push({
      action: 'FILE_DOWNLOAD_ACCESSED',
      timestamp: new Date().toISOString(),
      actor: matchingOrder.customerPhone || 'CUSTOMER',
      details: `Category: ${category || 'all'} (Total count: ${matchingOrder.downloadCount})`,
    });
    ordersCache.set(matchingOrder.id, matchingOrder);
    persistOrders();

    const selectedKey = (category || 'all').toLowerCase();
    const manifestItem = CATEGORY_DOWNLOAD_MANIFEST[selectedKey] || CATEGORY_DOWNLOAD_MANIFEST['all'];

    return res.json({
      success: true,
      orderId: matchingOrder.id,
      productName: matchingOrder.productName,
      customerName: matchingOrder.customerName,
      categoryKey: selectedKey,
      package: {
        ...manifestItem,
        directVaultUrl: storeConfig.masterDriveLink || manifestItem.directVaultUrl,
      },
      accessInstructions: [
        '1. Click Open Google Drive Master Vault to access the complete library.',
        '2. Add to your Drive or download folders directly.',
        '3. 100% Watermark-Free 1080x1920 9:16 vertical MP4s.',
        '4. Instant compatibility with CapCut, Premiere, InShot, VN.',
        '5. Commercial monetization rights granted for your content channels.',
      ],
      supportContact: storeConfig.supportEmail,
    });
  } catch (err: any) {
    console.error('[Reels Store] Download error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing download request.' });
  }
});

// ==========================================
// 10. ADMIN: Get & Update Store Configuration
// ==========================================
reelsRouter.get('/admin/config', (_req: Request, res: Response) => {
  return res.json({ success: true, config: storeConfig });
});

reelsRouter.post('/admin/config', (req: Request, res: Response) => {
  try {
    const {
      upiId,
      receiverName,
      customQrUrl,
      autoApprovalTestMode,
      productPrice,
      productName,
      campaignName,
      headline,
      subtitle,
      badgeText,
      masterDriveLink,
      supportEmail,
      supportPhone,
    } = req.body || {};

    if (productPrice !== undefined && !isNaN(Number(productPrice))) {
      storeConfig.productPrice = Math.max(1, Math.round(Number(productPrice)));
    }
    if (typeof productName === 'string' && productName.trim()) {
      storeConfig.productName = productName.trim();
    }
    if (typeof campaignName === 'string' && campaignName.trim()) {
      storeConfig.campaignName = campaignName.trim();
    }
    if (typeof headline === 'string' && headline.trim()) {
      storeConfig.headline = headline.trim();
    }
    if (typeof subtitle === 'string' && subtitle.trim()) {
      storeConfig.subtitle = subtitle.trim();
    }
    if (typeof badgeText === 'string' && badgeText.trim()) {
      storeConfig.badgeText = badgeText.trim();
    }
    if (typeof masterDriveLink === 'string' && masterDriveLink.trim()) {
      storeConfig.masterDriveLink = masterDriveLink.trim();
    }
    if (upiId && typeof upiId === 'string' && upiId.includes('@')) {
      storeConfig.upiId = upiId.trim();
    }
    if (receiverName && typeof receiverName === 'string' && receiverName.trim()) {
      storeConfig.receiverName = receiverName.trim();
    }
    if (typeof customQrUrl === 'string') {
      storeConfig.customQrUrl = customQrUrl.trim();
    }
    if (typeof supportEmail === 'string' && supportEmail.includes('@')) {
      storeConfig.supportEmail = supportEmail.trim();
    }
    if (typeof supportPhone === 'string' && supportPhone.trim()) {
      storeConfig.supportPhone = supportPhone.trim();
    }
    if (typeof autoApprovalTestMode === 'boolean') {
      storeConfig.autoApprovalTestMode = autoApprovalTestMode;
    }

    persistConfig();

    // Broadcast config update in real-time to all clients (including Master Vault link)
    broadcastSSE({
      eventType: 'CONFIG_UPDATED',
      config: storeConfig,
      masterDriveLink: storeConfig.masterDriveLink,
      timestamp: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: 'Store configuration updated successfully. All changes are live.',
      config: storeConfig,
    });
  } catch (err: any) {
    console.error('[Reels Store Admin] Update config error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error saving configuration.' });
  }
});

// ==========================================
// 10B. ADMIN: Update Offer Popup Section Details
// Completely updates text, link, logo, prices, categories, trust badges
// ==========================================
reelsRouter.post('/admin/popup-config', (req: Request, res: Response) => {
  try {
    const incoming = req.body || {};
    
    // Validate and merge fields safely
    popupConfig = {
      ...popupConfig,
      ...incoming,
      updatedAt: new Date().toISOString(),
    };

    if (incoming.offerPrice !== undefined && !isNaN(Number(incoming.offerPrice))) {
      popupConfig.offerPrice = Math.max(0, Math.round(Number(incoming.offerPrice)));
    }
    if (incoming.originalPrice !== undefined && !isNaN(Number(incoming.originalPrice))) {
      popupConfig.originalPrice = Math.max(0, Math.round(Number(incoming.originalPrice)));
    }
    if (typeof incoming.headline === 'string' && incoming.headline.trim()) {
      popupConfig.headline = incoming.headline.trim();
    }
    if (typeof incoming.subheadline === 'string' && incoming.subheadline.trim()) {
      popupConfig.subheadline = incoming.subheadline.trim();
    }
    if (typeof incoming.badgeText === 'string') {
      popupConfig.badgeText = incoming.badgeText.trim();
    }
    if (typeof incoming.discountBadge === 'string') {
      popupConfig.discountBadge = incoming.discountBadge.trim();
    }
    if (typeof incoming.customLogoUrl === 'string') {
      popupConfig.customLogoUrl = incoming.customLogoUrl.trim();
    }
    if (typeof incoming.customLogoLink === 'string') {
      popupConfig.customLogoLink = incoming.customLogoLink.trim();
    }
    if (typeof incoming.masterVaultLink === 'string') {
      popupConfig.masterVaultLink = incoming.masterVaultLink.trim();
    }
    if (typeof incoming.supportLink === 'string') {
      popupConfig.supportLink = incoming.supportLink.trim();
    }
    if (typeof incoming.floatingBadgeLink === 'string') {
      popupConfig.floatingBadgeLink = incoming.floatingBadgeLink.trim();
    }
    if (typeof incoming.primaryButtonText === 'string' && incoming.primaryButtonText.trim()) {
      popupConfig.primaryButtonText = incoming.primaryButtonText.trim();
    }
    if (typeof incoming.primaryButtonLink === 'string') {
      popupConfig.primaryButtonLink = incoming.primaryButtonLink.trim();
    }
    if (typeof incoming.secondaryButtonText === 'string' && incoming.secondaryButtonText.trim()) {
      popupConfig.secondaryButtonText = incoming.secondaryButtonText.trim();
    }
    if (typeof incoming.secondaryButtonLink === 'string') {
      popupConfig.secondaryButtonLink = incoming.secondaryButtonLink.trim();
    }
    if (typeof incoming.floatingBadgeTitle === 'string' && incoming.floatingBadgeTitle.trim()) {
      popupConfig.floatingBadgeTitle = incoming.floatingBadgeTitle.trim();
    }
    if (typeof incoming.floatingBadgeSubtext === 'string' && incoming.floatingBadgeSubtext.trim()) {
      popupConfig.floatingBadgeSubtext = incoming.floatingBadgeSubtext.trim();
    }
    if (Array.isArray(incoming.categories)) {
      popupConfig.categories = incoming.categories;
    }
    if (Array.isArray(incoming.trustBadges)) {
      popupConfig.trustBadges = incoming.trustBadges;
    }

    persistPopupConfig();

    broadcastSSE({
      eventType: 'POPUP_CONFIG_UPDATED',
      config: popupConfig,
      timestamp: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: 'Offer section configuration updated successfully. All changes are live.',
      config: popupConfig,
    });
  } catch (err: any) {
    console.error('[Reels Store Admin] Update popup config error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error saving offer section configuration.' });
  }
});

// ==========================================
// 11. PUBLIC: Customer Support Form
// ==========================================
reelsRouter.post('/support', (req: Request, res: Response) => {
  try {
    const { name, phone, orderId, message } = req.body || {};

    if (!name || !message) {
      return res.status(400).json({ success: false, error: 'Name and message are required.' });
    }

    const ticket = {
      id: `SUP-${Date.now().toString(36).toUpperCase()}`,
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : null,
      orderId: orderId ? String(orderId).trim() : null,
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    let tickets: any[] = [];
    try {
      if (fs.existsSync(SUPPORT_FILE)) {
        tickets = JSON.parse(fs.readFileSync(SUPPORT_FILE, 'utf-8'));
      }
    } catch (_) {}

    tickets.push(ticket);
    try {
      fs.writeFileSync(SUPPORT_FILE, JSON.stringify(tickets, null, 2));
    } catch (_) {}

    // Alert Murari via notification
    createAdminNotification({
      type: 'SYSTEM_WARNING',
      severity: 'INFO',
      title: 'New Customer Support Inquiry',
      message: `Inquiry from ${ticket.name} (${ticket.phone || 'No phone'}): "${ticket.message.slice(0, 100)}..."`,
      relatedOrderId: ticket.orderId || undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted. Murari will review and reply promptly.',
      ticketId: ticket.id,
    });
  } catch (err: any) {
    console.error('[Reels Store] Support ticket error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error submitting support ticket.' });
  }
});

// ==========================================
// 12. RESOURCE REGISTRY ENDPOINTS
// ==========================================

// Helper: Check external URL accessibility without throwing or creating false-positives
async function checkUrlAccessibility(targetUrl: string): Promise<{
  status: ResourceAvailabilityStatus;
  statusCode?: number;
  message: string;
  isGoogleDrive: boolean;
  isDriveFile: boolean;
  isDriveFolder: boolean;
}> {
  const isGoogleDrive = targetUrl.includes('drive.google.com');
  const isDriveFile = targetUrl.includes('/file/d/');
  const isDriveFolder = targetUrl.includes('/folders/');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(targetUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
      redirect: 'manual',
    });
    clearTimeout(timeout);

    const status = resp.status;

    // Google Drive specific handling
    if (isGoogleDrive) {
      // 200, 301, 302, 303, 307 are typical Google Drive responses (often redirecting to login if non-public)
      if (status >= 200 && status < 400) {
        return {
          status: 'verified',
          statusCode: status,
          message: 'Google Drive resource verified reachable.',
          isGoogleDrive,
          isDriveFile,
          isDriveFolder,
        };
      }
      if (status === 404) {
        return {
          status: 'not_found',
          statusCode: 404,
          message: 'Google Drive file or folder not found (404).',
          isGoogleDrive,
          isDriveFile,
          isDriveFolder,
        };
      }
      if (status === 403) {
        return {
          status: 'auth_required',
          statusCode: 403,
          message: 'Google Drive requires authentication / account sign-in.',
          isGoogleDrive,
          isDriveFile,
          isDriveFolder,
        };
      }
    }

    // General HTTPS links
    if (status >= 200 && status < 400) {
      return {
        status: 'verified',
        statusCode: status,
        message: 'Destination URL is verified reachable.',
        isGoogleDrive,
        isDriveFile,
        isDriveFolder,
      };
    } else if (status === 404) {
      return {
        status: 'not_found',
        statusCode: 404,
        message: 'Destination returned Not Found (404).',
        isGoogleDrive,
        isDriveFile,
        isDriveFolder,
      };
    } else if (status === 401 || status === 403) {
      return {
        status: 'auth_required',
        statusCode: status,
        message: 'Access restricted or authentication required.',
        isGoogleDrive,
        isDriveFile,
        isDriveFolder,
      };
    } else {
      return {
        status: 'inconclusive',
        statusCode: status,
        message: `HTTP ${status} received. Automated verification inconclusive.`,
        isGoogleDrive,
        isDriveFile,
        isDriveFolder,
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        status: 'inconclusive',
        message: 'Request timed out. Automated verification inconclusive.',
        isGoogleDrive,
        isDriveFile,
        isDriveFolder,
      };
    }
    return {
      status: 'inconclusive',
      message: 'Automated request was inconclusive. Manual access verification available.',
      isGoogleDrive,
      isDriveFile,
      isDriveFolder,
    };
  }
}

// Public: Get all active resources
reelsRouter.get('/resources', (_req: Request, res: Response) => {
  const activeResources = Array.from(resourcesCache.values())
    .filter(r => r.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return res.json({
    success: true,
    count: activeResources.length,
    resources: activeResources,
    masterDriveLink: storeConfig.masterDriveLink,
  });
});

// Admin: Get all resources with audit history
reelsRouter.get('/admin/resources', (_req: Request, res: Response) => {
  const allResources = Array.from(resourcesCache.values())
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return res.json({
    success: true,
    count: allResources.length,
    resources: allResources,
    masterDriveLink: storeConfig.masterDriveLink,
  });
});

// Admin: Update a single resource
reelsRouter.put('/admin/resources/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = resourcesCache.get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: `Resource '${id}' not found.` });
    }

    const {
      title,
      description,
      destinationUrl,
      category,
      categoryLabel,
      categoryColor,
      badge,
      countBadge,
      resourceType,
      isActive,
      sortOrder,
      availabilityStatus,
      notes,
      adminId,
    } = req.body || {};

    const audit: any[] = existing.auditHistory || [];
    if (destinationUrl && destinationUrl !== existing.destinationUrl) {
      audit.push({
        timestamp: new Date().toISOString(),
        adminId: adminId || 'Murari Panjiyar (Admin)',
        action: 'DESTINATION_URL_CHANGED',
        fieldChanged: 'destinationUrl',
        oldValue: existing.destinationUrl,
        newValue: destinationUrl,
        details: 'Admin updated resource URL destination.',
      });
    }

    const updated: MegaPackResource = {
      ...existing,
      title: typeof title === 'string' && title.trim() ? title.trim() : existing.title,
      description: typeof description === 'string' ? description.trim() : existing.description,
      destinationUrl:
        typeof destinationUrl === 'string' && destinationUrl.trim()
          ? destinationUrl.trim()
          : existing.destinationUrl,
      category: category || existing.category,
      categoryLabel: categoryLabel || existing.categoryLabel,
      categoryColor: categoryColor || existing.categoryColor,
      badge: badge !== undefined ? badge : existing.badge,
      countBadge: countBadge !== undefined ? countBadge : existing.countBadge,
      resourceType: resourceType || existing.resourceType,
      isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : existing.sortOrder,
      availabilityStatus: availabilityStatus || existing.availabilityStatus,
      notes: notes !== undefined ? notes : existing.notes,
      updatedAt: new Date().toISOString(),
      auditHistory: audit,
    };

    resourcesCache.set(id, updated);
    persistResources();

    // Broadcast update across SSE to all connected clients
    broadcastSSE({
      eventType: 'RESOURCE_UPDATED',
      resource: updated,
      timestamp: updated.updatedAt,
    });

    return res.json({
      success: true,
      message: `Resource '${updated.title}' updated successfully.`,
      resource: updated,
    });
  } catch (err: any) {
    console.error('[Reels Store Admin] Update resource error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error updating resource.' });
  }
});

// Admin: Validate Link Endpoint
reelsRouter.post('/admin/resources/validate-link', async (req: Request, res: Response) => {
  try {
    const { url, resourceId } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required.' });
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return res.json({
        success: true,
        status: 'invalid_url',
        message: 'URL must start with http:// or https://',
      });
    }

    const validationResult = await checkUrlAccessibility(trimmedUrl);

    // If resourceId provided, update that resource's status in registry
    if (resourceId && resourcesCache.has(resourceId)) {
      const resObj = resourcesCache.get(resourceId)!;
      resObj.availabilityStatus = validationResult.status;
      resObj.lastCheckedAt = new Date().toISOString();
      resObj.updatedAt = new Date().toISOString();
      resourcesCache.set(resourceId, resObj);
      persistResources();

      broadcastSSE({
        eventType: 'RESOURCE_UPDATED',
        resource: resObj,
        timestamp: resObj.updatedAt,
      });
    }

    return res.json({
      success: true,
      ...validationResult,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Validation check failed.' });
  }
});

