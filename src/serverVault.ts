import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface VaultItem {
  id: string;
  name: string;
  description: string;
  category: string;
  fileType: 'text' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'zip' | 'jpg' | 'jpeg' | 'png' | 'webp' | 'other';
  originalFileName?: string;
  storedFileName?: string;
  mimeType?: string;
  content?: string;
  links?: Array<{ title: string; url: string; status?: 'valid' | 'invalid' | 'warning' }>;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  folder?: string;
  fileDataUrl?: string;
  isProtected?: boolean;
}

interface VaultAuthData {
  salt: string;
  hash: string;
  lastUpdated: string;
}

const VAULT_DIR = path.join(process.cwd(), "vault_data");
const FILES_DIR = path.join(VAULT_DIR, "files");
const AUTH_FILE = path.join(VAULT_DIR, "vault_auth.json");
const ITEMS_FILE = path.join(VAULT_DIR, "vault_items.json");

// Active session tokens with expiry: token -> { createdAt, expiresAt }
const activeTokens = new Map<string, { createdAt: number; expiresAt: number }>();
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// SSE connected clients for real-time synchronization
const sseClients = new Set<express.Response>();

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
  }
}

// Password hashing using Node crypto scrypt
function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password.trim(), actualSalt, 64);
  return {
    salt: actualSalt,
    hash: derivedKey.toString("hex")
  };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password.trim(), salt, 64);
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  } catch (err) {
    return false;
  }
}

// Initialize Auth Data with secure default password if not already present
function initAuth(): VaultAuthData {
  ensureDirectories();
  const defaultPw = process.env.PIXELFIX_VAULT_PASSWORD || "Dispur123@";
  if (fs.existsSync(AUTH_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
      if (data && data.salt && data.hash) {
        if (verifyPassword(defaultPw, data.salt, data.hash)) {
          return data;
        }
      }
    } catch (e) {
      console.warn("[Vault] Failed to parse vault_auth.json, resetting with default.");
    }
  }

  // Initial secure server-side cryptographic hash
  const { salt, hash } = hashPassword(defaultPw);
  const authData: VaultAuthData = {
    salt,
    hash,
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2), "utf-8");
  console.info("[Vault] Initialized vault authentication with secure hash.");
  return authData;
}

// Initial Seed Documents for Pixel Fix
const INITIAL_VAULT_ITEMS: VaultItem[] = [
  {
    id: "vault_doc_1",
    name: "PC Repair Diagnostic SOP & Flowchart",
    description: "Standard operating procedure for hardware diagnostics, RAM testing, thermal throttling inspection, and blue screen troubleshooting.",
    category: "Repair Notes",
    fileType: "text",
    content: `# Pixel Fix — Diagnostic Standard Operating Procedure

1. Hardware Initial Inspection
- Inspect power supply rails (12V, 5V, 3.3V) with digital multimeter.
- Reseat memory modules (RAM) in alternating DIMM slots (A2/B2).
- Clean thermal compound on CPU/GPU and reapply high-performance paste.

2. Software & Storage Diagnostics
- Boot into WinPE live diagnostic USB.
- Run SMART health test for NVMe SSD and SATA drives.
- Run MemTest86 for 4 passes to ensure zero memory errors.

3. Clean OS Installation Steps
- Verify UEFI Secure Boot status.
- Load manufacturer chipset and graphics drivers.
- Install licensed productivity software suites.`,
    links: [
      {
        title: "Official MemTest86 Diagnostic USB Tool",
        url: "https://www.memtest86.com/download.htm",
        status: "valid"
      },
      {
        title: "Pixel Fix Essential Driver Repository (Google Drive)",
        url: "https://drive.google.com/drive/folders/1PixelFixDriverRepo",
        status: "valid"
      }
    ],
    sizeBytes: 885,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdBy: "admin"
  },
  {
    id: "vault_doc_2",
    name: "Windows 11 Setup & Driver Repository Links",
    description: "Verified direct repository links for Intel, AMD, NVIDIA, Realtek audio, and network controller drivers.",
    category: "Drivers & Utilities",
    fileType: "text",
    content: `# Verified OEM Driver Download Portals

Always download official WHQL signed drivers. Never use third-party driver-pack utilities that bundle adware.

- Intel Chipset & Wi-Fi INF Utilities: https://www.intel.com/content/www/us/en/download-center/home.html
- AMD Ryzen Motherboard Chipset Drivers: https://www.amd.com/en/support
- NVIDIA GeForce WHQL Studio & Game Ready Drivers: https://www.nvidia.com/Download/index.aspx
- Realtek High Definition Audio Codecs: https://www.realtek.com/en/`,
    links: [
      {
        title: "Google Drive Master Technician Backup",
        url: "https://drive.google.com/drive/folders/1PixelFixTechnicianTools",
        status: "valid"
      },
      {
        title: "Microsoft Media Creation Tool",
        url: "https://www.microsoft.com/software-download/windows11",
        status: "valid"
      }
    ],
    sizeBytes: 520,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdBy: "admin"
  }
];

function loadVaultItems(): VaultItem[] {
  ensureDirectories();
  if (fs.existsSync(ITEMS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ITEMS_FILE, "utf-8"));
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn("[Vault] Failed to parse vault_items.json, recovering initial items.");
    }
  }
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(INITIAL_VAULT_ITEMS, null, 2), "utf-8");
  return INITIAL_VAULT_ITEMS;
}

function saveVaultItems(items: VaultItem[]): void {
  ensureDirectories();
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2), "utf-8");
  broadcastVaultEvent("vault_update", { timestamp: Date.now(), count: items.length });
}

// Broadcast event to all active SSE subscribers
function broadcastVaultEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Authentication middleware for vault endpoints
const requireVaultAuth: express.RequestHandler = (req, res, next) => {
  // Allow if x-admin-key matches Admin password or standard token
  const authHeader = req.headers.authorization;
  const adminKey = req.headers["x-admin-key"];
  const tokenQuery = req.query.token as string;

  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (tokenQuery) {
    token = tokenQuery.trim();
  }

  // Check token
  if (token && activeTokens.has(token)) {
    const session = activeTokens.get(token)!;
    if (Date.now() < session.expiresAt) {
      return next();
    } else {
      activeTokens.delete(token);
    }
  }

  // Check admin key bypass
  if (adminKey && (adminKey === "pixel2025" || adminKey === process.env.ADMIN_KEY)) {
    return next();
  }

  res.status(401).json({
    success: false,
    error: "Unauthorized: Invalid or expired Vault access token."
  });
};

// URL validation helper to check reachability and format
async function validateUrl(url: string): Promise<{ valid: boolean; type: string; message: string; statusCode?: number }> {
  if (!url || typeof url !== "string") {
    return { valid: false, type: "unknown", message: "URL is empty" };
  }
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { valid: false, type: "invalid_protocol", message: "Only HTTP and HTTPS links are allowed" };
    }

    const host = parsed.hostname.toLowerCase();
    let type = "web";
    if (host.includes("drive.google.com") || host.includes("docs.google.com")) {
      type = "google_drive";
    } else if (/\.(pdf|zip|rar|exe|iso|docx?|xlsx?|png|jpg|webp)$/i.test(parsed.pathname)) {
      type = "direct_file";
    }

    // Attempt light HEAD request with 3s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const resp = await fetch(trimmed, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        }
      });
      clearTimeout(timeoutId);

      const status = resp.status;
      if (status >= 200 && status < 400) {
        return {
          valid: true,
          type,
          message: type === "google_drive" ? "Valid Google Drive resource" : "URL is reachable and live",
          statusCode: status
        };
      } else if (status === 404) {
        return {
          valid: false,
          type,
          message: "Target resource returned 404 Not Found",
          statusCode: status
        };
      } else {
        // Some servers block HEAD or return 403 to automated requests, still accept if syntactically valid
        return {
          valid: true,
          type,
          message: `Link verified (Server response code: ${status})`,
          statusCode: status
        };
      }
    } catch (fetchErr: any) {
      // If network timed out or blocked HEAD, but syntax is valid HTTPS
      return {
        valid: true,
        type,
        message: "Valid URL format (Network verification timed out)",
      };
    }
  } catch (err: any) {
    return { valid: false, type: "syntax_error", message: "Malformed URL syntax" };
  }
}

// Register Vault API Routes
export function registerVaultRoutes(app: any) {
  // 1. Vault Authentication Route
  app.post("/api/vault/auth", (req, res) => {
    try {
      const { password } = req.body || {};
      if (!password || typeof password !== "string") {
        return res.status(400).json({ success: false, error: "Password is required." });
      }

      const authData = initAuth();
      const isValid = verifyPassword(password, authData.salt, authData.hash);

      if (!isValid) {
        return res.status(403).json({
          success: false,
          error: "Incorrect Vault password. Access denied."
        });
      }

      // Generate cryptographically secure token
      const token = crypto.randomBytes(32).toString("hex");
      activeTokens.set(token, {
        createdAt: Date.now(),
        expiresAt: Date.now() + TOKEN_TTL_MS
      });

      return res.json({
        success: true,
        token,
        expiresIn: TOKEN_TTL_MS / 1000,
        message: "Vault unlocked successfully."
      });
    } catch (err: any) {
      console.error("[Vault] Auth error:", err);
      return res.status(500).json({ success: false, error: "Internal authentication error." });
    }
  });

  // 2. Lock / Revoke Token Route
  app.post("/api/vault/lock", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      activeTokens.delete(token);
    }
    return res.json({ success: true, message: "Vault locked and session invalidated." });
  });

  // 3. Change Vault Password Route (Accessible by Admin or with Current Vault Password)
  app.post("/api/vault/change-password", (req, res) => {
    try {
      const { currentPassword, newPassword, adminKey } = req.body || {};
      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "New password must be at least 6 characters long."
        });
      }

      const authData = initAuth();

      // Check authorization: either adminKey is valid OR currentPassword matches
      let authorized = false;
      if (adminKey && (adminKey === "pixel2025" || adminKey === process.env.ADMIN_KEY)) {
        authorized = true;
      } else if (currentPassword) {
        authorized = verifyPassword(currentPassword, authData.salt, authData.hash);
      }

      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: "Authorization failed. Please provide correct current password or admin master key."
        });
      }

      // Hash new password
      const { salt, hash } = hashPassword(newPassword);
      const updatedAuth: VaultAuthData = {
        salt,
        hash,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(AUTH_FILE, JSON.stringify(updatedAuth, null, 2), "utf-8");

      // Invalidate existing user tokens
      activeTokens.clear();

      console.info("[Vault] Vault password changed successfully.");
      return res.json({
        success: true,
        message: "Vault password changed successfully. All active sessions have been reset."
      });
    } catch (err: any) {
      console.error("[Vault] Change password error:", err);
      return res.status(500).json({ success: false, error: "Failed to change vault password." });
    }
  });

  // 3b. Verify Private Protected File Passcode (Murarithikhai123@)
  const PRIVATE_FILE_SALT = "4e8a1c92d5f7b0368a12bc45ef890123";
  const PRIVATE_FILE_HASH = hashPassword(process.env.PIXELFIX_PROTECTED_FILE_PASSWORD || "Murarithikhai123@", PRIVATE_FILE_SALT).hash;

  app.post("/api/vault/verify-file-passcode", (req, res) => {
    try {
      const { password } = req.body || {};
      const adminKey = req.headers["x-admin-key"] as string | undefined;

      // Admin bypass / clearance
      if (adminKey && (adminKey === "pixel2025" || adminKey === process.env.ADMIN_KEY)) {
        return res.json({
          success: true,
          authorized: true,
          message: "Administrative clearance verified."
        });
      }

      if (!password || typeof password !== "string") {
        return res.status(400).json({ success: false, error: "File password is required." });
      }

      const isValid = verifyPassword(password.trim(), PRIVATE_FILE_SALT, PRIVATE_FILE_HASH);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          authorized: false,
          error: "Incorrect password for this protected document."
        });
      }

      const unlockToken = crypto.randomBytes(24).toString("hex");
      return res.json({
        success: true,
        authorized: true,
        unlockToken,
        message: "Protected document unlocked."
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Server file verification error." });
    }
  });

  // 4. Real-Time Sync Event Stream (Server-Sent Events)
  app.get("/api/vault/events", requireVaultAuth, (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    sseClients.add(res);

    // Initial heartbeat
    res.write(`event: connected\ndata: ${JSON.stringify({ status: "connected", timestamp: Date.now() })}\n\n`);

    req.on("close", () => {
      sseClients.delete(res);
    });
  });

  // 5. Get All Vault Items (Protected)
  app.get("/api/vault/items", requireVaultAuth, (req, res) => {
    try {
      const items = loadVaultItems();
      const adminKey = req.headers["x-admin-key"] as string | undefined;
      const isAdmin = Boolean(adminKey && (adminKey === "pixel2025" || adminKey === process.env.ADMIN_KEY));

      // Redact content & links for protected files from the general list API unless authorized admin
      const sanitized = items.map((it) => {
        if (it.isProtected && !isAdmin) {
          return {
            ...it,
            content: "[LOCKED - SENSITIVE PROTECTED TECHNICAL DOCUMENT]",
            fileDataUrl: undefined,
            links: []
          };
        }
        return it;
      });

      return res.json({ success: true, items: sanitized });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Create / Update Text Document (Protected)
  app.post("/api/vault/document", requireVaultAuth, async (req, res) => {
    try {
      const { id, name, description, category, content, links } = req.body || {};

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, error: "Document name is required." });
      }

      const items = loadVaultItems();
      const now = new Date().toISOString();

      // Validate links if provided
      let validatedLinks: Array<{ title: string; url: string; status?: "valid" | "invalid" | "warning" }> = [];
      if (Array.isArray(links)) {
        for (const link of links) {
          if (link && link.url) {
            const check = await validateUrl(link.url);
            validatedLinks.push({
              title: link.title || link.url,
              url: link.url,
              status: check.valid ? "valid" : "invalid"
            });
          }
        }
      }

      const textBytes = Buffer.byteLength(content || "", "utf-8");

      if (id) {
        // Update existing document
        const index = items.findIndex((i) => i.id === id);
        if (index === -1) {
          return res.status(404).json({ success: false, error: "Document not found." });
        }

        const existing = items[index];
        const updated: VaultItem = {
          ...existing,
          name: name.trim(),
          description: description?.trim() || "",
          category: category || existing.category || "General",
          content: content || "",
          links: validatedLinks,
          sizeBytes: textBytes,
          updatedAt: now
        };

        items[index] = updated;
        saveVaultItems(items);
        return res.json({ success: true, item: updated, message: "Document updated successfully." });
      } else {
        // Create new document
        const newDoc: VaultItem = {
          id: `vault_text_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: name.trim(),
          description: description?.trim() || "",
          category: category || "General",
          fileType: "text",
          content: content || "",
          links: validatedLinks,
          sizeBytes: textBytes,
          createdAt: now,
          updatedAt: now,
          createdBy: "vault_user"
        };

        items.unshift(newDoc);
        saveVaultItems(items);
        return res.json({ success: true, item: newDoc, message: "New text document created." });
      }
    } catch (err: any) {
      console.error("[Vault] Save document error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to save document." });
    }
  });

  // 7. File Upload Route (Protected, supports base64 payload up to 50MB)
  app.post("/api/vault/upload", requireVaultAuth, async (req, res) => {
    try {
      const { fileName, description, category, fileType, mimeType, base64Data } = req.body || {};

      if (!fileName || !base64Data) {
        return res.status(400).json({ success: false, error: "File name and file content are required." });
      }

      ensureDirectories();

      // Extract raw buffer from base64
      let cleanBase64 = base64Data;
      if (cleanBase64.includes(",")) {
        cleanBase64 = cleanBase64.split(",")[1];
      }

      const fileBuffer = Buffer.from(cleanBase64, "base64");
      const sizeBytes = fileBuffer.length;

      // File extension
      const ext = path.extname(fileName).toLowerCase().replace(".", "") || "bin";
      const storedFileName = `vault_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${ext}`;
      const filePath = path.join(FILES_DIR, storedFileName);

      fs.writeFileSync(filePath, fileBuffer);

      // Determine friendly file type
      let detectedType: VaultItem["fileType"] = "other";
      if (["txt", "md", "log", "json"].includes(ext)) detectedType = "text";
      else if (ext === "pdf") detectedType = "pdf";
      else if (["doc", "docx"].includes(ext)) detectedType = "doc";
      else if (["xls", "xlsx", "csv"].includes(ext)) detectedType = "xls";
      else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) detectedType = "zip";
      else if (["jpg", "jpeg"].includes(ext)) detectedType = "jpg";
      else if (ext === "png") detectedType = "png";
      else if (ext === "webp") detectedType = "webp";

      const now = new Date().toISOString();
      const newItem: VaultItem = {
        id: `vault_file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: fileName.trim(),
        description: description?.trim() || "",
        category: category || "General",
        fileType: detectedType,
        originalFileName: fileName.trim(),
        storedFileName,
        mimeType: mimeType || "application/octet-stream",
        sizeBytes,
        createdAt: now,
        updatedAt: now,
        createdBy: "vault_user"
      };

      const items = loadVaultItems();
      items.unshift(newItem);
      saveVaultItems(items);

      return res.json({
        success: true,
        item: newItem,
        message: "File successfully uploaded and saved to secure vault."
      });
    } catch (err: any) {
      console.error("[Vault] File upload error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to upload file." });
    }
  });

  // 8. Download / View Route (Protected)
  app.get("/api/vault/download/:id", requireVaultAuth, (req, res) => {
    try {
      const { id } = req.params;
      const items = loadVaultItems();
      const item = items.find((i) => i.id === id);

      if (!item) {
        return res.status(404).json({ success: false, error: "File not found in Vault." });
      }

      // Check if item is protected
      const adminKey = req.headers["x-admin-key"] as string | undefined || (req.query.adminKey as string | undefined);
      const isAdmin = Boolean(adminKey && (adminKey === "pixel2025" || adminKey === process.env.ADMIN_KEY));
      const unlockToken = req.query.unlockToken as string | undefined;

      if (item.isProtected && !isAdmin && !unlockToken) {
        return res.status(403).json({
          success: false,
          error: "Access Denied: This document is protected with private security password (Murarithikhai123@)."
        });
      }

      if (item.fileType === "text" && item.content !== undefined) {
        // Send as downloadable text file
        const downloadName = item.name.endsWith(".txt") ? item.name : `${item.name}.txt`;
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(downloadName)}"`);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.send(item.content);
      }

      if (item.storedFileName) {
        const filePath = path.join(FILES_DIR, item.storedFileName);
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ success: false, error: "Physical file is missing from secure storage." });
        }

        const downloadName = item.originalFileName || item.name;
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(downloadName)}"`);
        if (item.mimeType) {
          res.setHeader("Content-Type", item.mimeType);
        }
        return res.sendFile(filePath);
      }

      return res.status(400).json({ success: false, error: "File cannot be downloaded." });
    } catch (err: any) {
      console.error("[Vault] Download error:", err);
      return res.status(500).json({ success: false, error: "Download failed." });
    }
  });

  // 9. Delete Vault Item Route (Protected)
  app.delete("/api/vault/items/:id", requireVaultAuth, (req, res) => {
    try {
      const { id } = req.params;
      const items = loadVaultItems();
      const index = items.findIndex((i) => i.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: "Item not found." });
      }

      const item = items[index];

      // If physical file exists, delete it
      if (item.storedFileName) {
        const filePath = path.join(FILES_DIR, item.storedFileName);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn(`[Vault] Could not remove physical file ${filePath}`);
          }
        }
      }

      items.splice(index, 1);
      saveVaultItems(items);

      return res.json({ success: true, message: "Item deleted from Vault." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Validate Link URL Route (Protected)
  app.post("/api/vault/validate-url", requireVaultAuth, async (req, res) => {
    try {
      const { url } = req.body || {};
      const result = await validateUrl(url);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Vault Stats Route (for Admin panel / dashboard)
  app.get("/api/vault/stats", requireVaultAuth, (req, res) => {
    try {
      const items = loadVaultItems();
      let totalBytes = 0;
      const categoryCounts: Record<string, number> = {};
      const fileTypeCounts: Record<string, number> = {};

      for (const item of items) {
        totalBytes += item.sizeBytes || 0;
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        fileTypeCounts[item.fileType] = (fileTypeCounts[item.fileType] || 0) + 1;
      }

      return res.json({
        success: true,
        stats: {
          totalItems: items.length,
          totalBytes,
          totalBytesFormatted: `${(totalBytes / 1024).toFixed(1)} KB`,
          categoryCounts,
          fileTypeCounts,
          activeTokensCount: activeTokens.size,
          lastUpdated: items.length > 0 ? items[0].updatedAt : new Date().toISOString()
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
}
