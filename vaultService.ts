import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface VaultLink {
  title: string;
  url: string;
  valid: boolean;
  type?: string;
}

export interface VaultItem {
  id: string;
  name: string;
  description: string;
  itemType: "text" | "file";
  fileType: string;
  mimeType: string;
  size: number;
  folder: string;
  content?: string;
  links?: VaultLink[];
  storedFileName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuthorizedUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  addedAt: string;
}

export interface VaultAuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
  user?: string;
}

export interface VaultConfig {
  salt: string;
  passwordHash: string;
  authorizedUsers: AuthorizedUser[];
  updatedAt: string;
}

const VAULT_DIR = path.join(process.cwd(), "vault_data");
const VAULT_FILES_DIR = path.join(VAULT_DIR, "files");
const CONFIG_FILE = path.join(VAULT_DIR, "vault_config.json");
const ITEMS_FILE = path.join(VAULT_DIR, "vault_items.json");
const AUDIT_FILE = path.join(VAULT_DIR, "vault_audit.json");

// In-memory active tokens: token -> { userId, role, createdAt, expiresAt }
interface VaultSession {
  token: string;
  userId: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}
const activeSessions = new Map<string, VaultSession>();

// Failed attempt tracker: ip -> { count, lockedUntil }
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

// SSE connected clients
const sseClients = new Set<(event: string, data: any) => void>();

function ensureDirectories() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
  if (!fs.existsSync(VAULT_FILES_DIR)) {
    fs.mkdirSync(VAULT_FILES_DIR, { recursive: true });
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function initVault() {
  ensureDirectories();

  // Initialize config if not present
  if (!fs.existsSync(CONFIG_FILE)) {
    const salt = crypto.randomBytes(16).toString("hex");
    // Default initial password is PixelVault2026! or Dispur123@
    const defaultPassword = process.env.VAULT_INITIAL_PASSWORD || "PixelVault2026!";
    const passwordHash = hashPassword(defaultPassword, salt);

    const initialConfig: VaultConfig = {
      salt,
      passwordHash,
      authorizedUsers: [
        {
          id: "usr_admin_murari",
          name: "Murari Panjiyar",
          email: "Mpanjiyar100@gmail.com",
          role: "admin",
          addedAt: new Date().toISOString()
        },
        {
          id: "usr_tech_doorstep",
          name: "Doorstep IT Tech Engineer",
          email: "support@pixelfix.in",
          role: "editor",
          addedAt: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2), "utf8");
    logAuditEvent("INIT", "Vault storage initialized with secure master credentials.");
  }

  // Initialize items file if not present
  if (!fs.existsSync(ITEMS_FILE)) {
    const sampleItems: VaultItem[] = [
      {
        id: "vlt_sample_pc_repair",
        name: "PC Repair & Windows 11 Diagnostics Notes",
        description: "Official doorstep customer diagnostic sequence & Windows installation driver links.",
        itemType: "text",
        fileType: "txt",
        mimeType: "text/plain",
        size: 1420,
        folder: "PC Repair",
        content: `### Pixel Fix Doorstep Diagnostic & Repair Protocol

1. **Physical Power & Beep Code Verification**
   - Check SMPS rail voltages (12V, 5V, 3.3V).
   - Listen for motherboard AMI/Award BIOS beep sequence codes.
   - Clean RAM contacts with isopropyl alcohol.

2. **Operating System Upgrades & Reinstallations**
   - Windows 11 24H2 UEFI USB boot checklist.
   - Genuine license digital entitlement bind verification.
   - Disable telemetry services and optimize SSD alignment.

3. **Required Hardware Drivers & Direct Packages**
   - Download Intel RST Chipset & NVMe Rapid Storage Drivers.
   - Realtek High Definition Audio & Gigabit LAN drivers.`,
        links: [
          {
            title: "Download Driver Package (Google Drive)",
            url: "https://drive.google.com/drive/folders/1PixelFixDriverCollectionAssam2026",
            valid: true,
            type: "Google Drive"
          },
          {
            title: "Official Microsoft Windows 11 Media Tool",
            url: "https://www.microsoft.com/software-download/windows11",
            valid: true,
            type: "Official Direct Download"
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "Murari Panjiyar"
      },
      {
        id: "vlt_sample_smps_guide",
        name: "PSU Wattage & SMPS Sizing Reference",
        description: "Guidelines for choosing high-efficiency 80-Plus Bronze and Gold power supplies.",
        itemType: "text",
        fileType: "txt",
        mimeType: "text/plain",
        size: 980,
        folder: "Guides",
        content: `### SMPS Troubleshooting & Peak Rail Calculations

- Core i5/Ryzen 5 + RTX 3060/4060: Minimum 550W (80+ Bronze)
- Core i7/Ryzen 7 + RTX 4070/Ti: Minimum 650W - 750W (80+ Gold)
- Check +12V single rail amp rating before high-draw stress testing.
- Always install spike protectors/surge suppressors in Guwahati doorstep environments.`,
        links: [
          {
            title: "Corsair & Cooler Master PSU Calculator",
            url: "https://www.coolermaster.com/en-global/power-supply-calculator/",
            valid: true,
            type: "External Utility"
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        createdBy: "Murari Panjiyar"
      }
    ];

    fs.writeFileSync(ITEMS_FILE, JSON.stringify(sampleItems, null, 2), "utf8");
  }

  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

export function getVaultConfig(): VaultConfig {
  ensureDirectories();
  if (!fs.existsSync(CONFIG_FILE)) {
    initVault();
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
}

export function saveVaultConfig(cfg: VaultConfig) {
  ensureDirectories();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf8");
}

export function getVaultItems(): VaultItem[] {
  ensureDirectories();
  if (!fs.existsSync(ITEMS_FILE)) {
    initVault();
  }
  try {
    return JSON.parse(fs.readFileSync(ITEMS_FILE, "utf8"));
  } catch (err) {
    return [];
  }
}

export function saveVaultItems(items: VaultItem[]) {
  ensureDirectories();
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2), "utf8");
  broadcastUpdate("ITEMS_UPDATED", { count: items.length });
}

export function logAuditEvent(action: string, details: string, ip?: string, user?: string) {
  ensureDirectories();
  try {
    let logs: VaultAuditLog[] = [];
    if (fs.existsSync(AUDIT_FILE)) {
      logs = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8"));
    }
    const newLog: VaultAuditLog = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      action,
      details,
      timestamp: new Date().toISOString(),
      ip,
      user
    };
    logs.unshift(newLog);
    if (logs.length > 200) {
      logs = logs.slice(0, 200);
    }
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch (e) {
    // Ignore audit logging errors
  }
}

export function getAuditLogs(): VaultAuditLog[] {
  ensureDirectories();
  if (!fs.existsSync(AUDIT_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8"));
  } catch {
    return [];
  }
}

export function authenticateVaultPassword(password: string, ip: string = "unknown"): { success: boolean; token?: string; user?: AuthorizedUser; role?: string; error?: string } {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);
  if (attempt && attempt.lockedUntil > now) {
    const waitSec = Math.ceil((attempt.lockedUntil - now) / 1000);
    return {
      success: false,
      error: `Security lockout active due to multiple failed attempts. Please retry in ${waitSec} seconds.`
    };
  }

  const config = getVaultConfig();
  const inputHash = hashPassword(password, config.salt);

  // Check master password OR check if matches Dispur123@ admin key fallback
  let isMatch = inputHash === config.passwordHash;
  if (!isMatch && (password === "Dispur123@" || password === "PixelVault2026!")) {
    isMatch = true;
  }

  if (!isMatch) {
    const cur = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    cur.count += 1;
    if (cur.count >= 5) {
      cur.lockedUntil = now + 3 * 60 * 1000; // 3 minutes lockout
    }
    failedAttempts.set(ip, cur);
    logAuditEvent("AUTH_FAILED", `Failed password attempt (${cur.count}/5).`, ip);
    return {
      success: false,
      error: cur.count >= 5 
        ? "Too many failed attempts. Vault locked for 3 minutes for security."
        : `Invalid vault password. ${5 - cur.count} attempt(s) remaining before temporary lockout.`
    };
  }

  // Reset failed attempts on success
  failedAttempts.delete(ip);

  // Generate secure session token
  const token = crypto.randomBytes(32).toString("hex");
  const adminUser = config.authorizedUsers[0] || {
    id: "usr_admin",
    name: "Murari Panjiyar (Admin)",
    email: "Mpanjiyar100@gmail.com",
    role: "admin",
    addedAt: new Date().toISOString()
  };

  const session: VaultSession = {
    token,
    userId: adminUser.id,
    role: adminUser.role,
    createdAt: now,
    expiresAt: now + 12 * 60 * 60 * 1000 // 12 hours
  };
  activeSessions.set(token, session);

  logAuditEvent("AUTH_SUCCESS", `Vault unlocked successfully by ${adminUser.name}.`, ip, adminUser.name);

  return {
    success: true,
    token,
    user: adminUser,
    role: adminUser.role
  };
}

export function verifySessionToken(token: string | undefined): VaultSession | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

export function revokeSessionToken(token: string) {
  if (activeSessions.has(token)) {
    const sess = activeSessions.get(token);
    activeSessions.delete(token);
    logAuditEvent("LOGOUT", "Vault locked / session terminated.", undefined, sess?.userId);
  }
}

export function updateVaultPassword(currentPassword: string, newPassword: string, ip?: string): { success: boolean; error?: string } {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  const config = getVaultConfig();
  const currentHash = hashPassword(currentPassword, config.salt);
  let isCurrentValid = currentHash === config.passwordHash;
  if (!isCurrentValid && (currentPassword === "Dispur123@" || currentPassword === "PixelVault2026!")) {
    isCurrentValid = true;
  }

  if (!isCurrentValid) {
    return { success: false, error: "Incorrect current vault password." };
  }

  const newSalt = crypto.randomBytes(16).toString("hex");
  const newHash = hashPassword(newPassword, newSalt);

  config.salt = newSalt;
  config.passwordHash = newHash;
  config.updatedAt = new Date().toISOString();
  saveVaultConfig(config);

  logAuditEvent("PASSWORD_CHANGED", "Master vault password changed by authorized administrator.", ip);
  return { success: true };
}

// File saving
export function saveVaultFile(
  name: string,
  description: string,
  folder: string,
  fileType: string,
  mimeType: string,
  base64Data: string,
  userName: string = "Murari Panjiyar"
): VaultItem {
  ensureDirectories();
  const buffer = Buffer.from(base64Data, "base64");
  const size = buffer.length;

  const id = "vlt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
  const cleanExt = (fileType || "bin").replace(/^\./, "").toLowerCase();
  const storedFileName = `${id}.${cleanExt}`;
  const filePath = path.join(VAULT_FILES_DIR, storedFileName);

  fs.writeFileSync(filePath, buffer);

  const items = getVaultItems();
  const newItem: VaultItem = {
    id,
    name: name.trim(),
    description: description.trim(),
    itemType: "file",
    fileType: cleanExt,
    mimeType: mimeType || "application/octet-stream",
    size,
    folder: folder || "General",
    storedFileName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userName
  };

  items.unshift(newItem);
  saveVaultItems(items);

  logAuditEvent("FILE_UPLOAD", `Uploaded file "${newItem.name}" (${(size / 1024).toFixed(1)} KB).`, undefined, userName);
  return newItem;
}

export function getVaultFilePath(storedFileName: string): string | null {
  ensureDirectories();
  const safeName = path.basename(storedFileName);
  const fullPath = path.join(VAULT_FILES_DIR, safeName);
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  return null;
}

export function deleteVaultItem(id: string, userName: string = "Admin"): boolean {
  const items = getVaultItems();
  const index = items.findIndex(it => it.id === id);
  if (index === -1) return false;

  const item = items[index];
  if (item.storedFileName) {
    const fullPath = path.join(VAULT_FILES_DIR, path.basename(item.storedFileName));
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        // ignore delete file error
      }
    }
  }

  items.splice(index, 1);
  saveVaultItems(items);
  logAuditEvent("ITEM_DELETED", `Deleted vault item "${item.name}".`, undefined, userName);
  return true;
}

// SSE Subscription
export function addSseClient(client: (event: string, data: any) => void) {
  sseClients.add(client);
  return () => {
    sseClients.delete(client);
  };
}

export function broadcastUpdate(event: string, data: any) {
  for (const client of sseClients) {
    try {
      client(event, data);
    } catch {
      sseClients.delete(client);
    }
  }
}
