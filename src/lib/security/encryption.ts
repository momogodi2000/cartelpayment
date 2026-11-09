import crypto from "node:crypto";
import { getEnv } from "../env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const rawKey = getEnv().ENCRYPTION_KEY;
  // If hex string (64 characters = 32 bytes)
  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    return Buffer.from(rawKey, "hex");
  }
  // Otherwise derive 32-byte key via SHA-256
  return crypto.createHash("sha256").update(rawKey).digest();
}

/**
 * Encrypts plaintext string using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (hex)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let ciphertext = cipher.update(plaintext, "utf-8", "hex");
  ciphertext += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts an AES-256-GCM string (iv:authTag:ciphertext).
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextHex, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}
