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

// Master salt & scrypt hash for Dispur123@
const MASTER_SALT = "8f3b20c9e174a62174d812c3b4a5d6e7";
const MASTER_HASH = hashPassword(process.env.PIXELFIX_VAULT_PASSWORD || "Dispur123@", MASTER_SALT);

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-key");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

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

    if (!password || typeof password !== "string") {
      return res.status(400).json({ success: false, error: "Vault passcode is required." });
    }

    const isValid = verifyPassword(password, MASTER_SALT, MASTER_HASH);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Access denied. Invalid Vault passcode." });
    }

    // Generate authenticated session token
    const token = crypto.randomBytes(32).toString("hex");

    return res.status(200).json({
      success: true,
      token,
      message: "Vault cryptographic session established successfully."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Server authentication error." });
  }
}
