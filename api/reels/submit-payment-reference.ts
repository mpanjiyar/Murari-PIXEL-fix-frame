import crypto from "crypto";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "vault_data");
const ORDERS_FILE = path.join(DATA_DIR, "reels_orders.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "admin_notifications.json");

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-key");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { orderId, utrReference, customerName, customerPhone } = body || {};

    const rawInput = String(utrReference || "").trim();
    const cleanUtr = rawInput.replace(/^(utr|upi\s*ref(?:erence)?(?:\s*no)?|ref(?:\s*no)?|txn(?:\s*id)?|transaction\s*id)[:\s#-]*/i, "").replace(/[\s-]+/g, "");

    if (!cleanUtr || !/^\d{12}$/.test(cleanUtr)) {
      return res.status(400).json({
        success: false,
        error: "A genuine 12-digit numeric UPI Reference Number (UTR) is strictly required.",
      });
    }

    const cleanPhoneDigits = String(customerPhone || "").replace(/[^\d]/g, "");
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 10) {
      return res.status(400).json({
        success: false,
        error: "A valid 10-digit mobile phone number is strictly required.",
      });
    }

    const cleanName = String(customerName || "").trim();
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Please enter your full customer name (minimum 2 characters).",
      });
    }

    const nowIso = new Date().toISOString();
    const assignedId = orderId && String(orderId).startsWith("RP-")
      ? orderId
      : `RP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    const orderData = {
      id: assignedId,
      productId: "150k-mega-reels-pack",
      productName: "150K+ MEGA PACK — REELS & SHORTS",
      campaign: "Durga Puja Special Offer",
      amount: 199.0,
      currency: "INR",
      customerName: cleanName,
      customerPhone: cleanPhoneDigits,
      status: "PENDING_ADMIN_REVIEW",
      paymentMethod: "UPI_BHARATPE",
      utrReference: cleanUtr,
      submittedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Save to disk if vault_data directory is accessible
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      let orders: any[] = [];
      if (fs.existsSync(ORDERS_FILE)) {
        try {
          orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8")) || [];
        } catch {}
      }
      orders.unshift(orderData);
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders.slice(0, 500), null, 2));

      // Notification
      let notifs: any[] = [];
      if (fs.existsSync(NOTIFICATIONS_FILE)) {
        try {
          notifs = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, "utf-8")) || [];
        } catch {}
      }
      notifs.unshift({
        id: `NOTIF-${Date.now().toString(36).toUpperCase()}`,
        type: "MANUAL_VERIFICATION_REQUEST",
        severity: "INFO",
        title: "New Manual UPI Payment Verification Request",
        message: `Order ${assignedId} from ${cleanName} (${cleanPhoneDigits}) submitted UTR ${cleanUtr}.`,
        relatedOrderId: assignedId,
        customerName: cleanName,
        customerPhone: cleanPhoneDigits,
        amount: 199,
        utrReference: cleanUtr,
        createdAt: nowIso,
      });
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifs.slice(0, 200), null, 2));
    } catch (fsErr) {
      console.warn("Serverless fs write warning:", fsErr);
    }

    return res.status(200).json({
      success: true,
      message: "Your payment details have been submitted successfully. Your order is awaiting administrator verification. You will receive download access on this website after approval.",
      order: {
        id: assignedId,
        status: "PENDING_ADMIN_REVIEW",
        customerName: cleanName,
        customerPhone: cleanPhoneDigits,
        amount: 199,
        utrReference: cleanUtr,
        submittedAt: nowIso,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Internal server error submitting payment reference.",
    });
  }
}
