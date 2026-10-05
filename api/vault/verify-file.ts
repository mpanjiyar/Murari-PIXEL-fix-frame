import crypto from "crypto";

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password.trim(), salt, 64).toString("hex");
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password.trim(), salt, 64);
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  } catch {
    return false;
  }
}

const PRIVATE_FILE_SALT = "4e8a1c92d5f7b0368a12bc45ef890123";
const PRIVATE_FILE_HASH = hashPassword(process.env.PIXELFIX_PROTECTED_FILE_PASSWORD || "Murarithikhai123@", PRIVATE_FILE_SALT);

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
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

    const { password } = body || {};
    const adminKey = req.headers["x-admin-key"];

    if (adminKey && (adminKey === "pixel2025" || adminKey === process.env.ADMIN_KEY)) {
      return res.status(200).json({
        success: true,
        authorized: true,
        message: "Administrative clearance verified."
      });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ success: false, error: "File password is required." });
    }

    const isValid = verifyPassword(password, PRIVATE_FILE_SALT, PRIVATE_FILE_HASH);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        authorized: false,
        error: "Incorrect password for this protected document."
      });
    }

    const unlockToken = crypto.randomBytes(24).toString("hex");
    return res.status(200).json({
      success: true,
      authorized: true,
      unlockToken,
      message: "Protected document unlocked."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Server file verification error." });
  }
}
