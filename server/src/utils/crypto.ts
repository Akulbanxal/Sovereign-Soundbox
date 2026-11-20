import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;

function getKeyBuffer(): Buffer {
  return Buffer.from(env.SERVER_ENCRYPTION_KEY, 'hex');
}

/**
 * Encrypts a plaintext secret (such as an NWC connection URI) using AES-256-GCM.
 * Output format: iv_hex:auth_tag_hex:ciphertext_hex
 */
export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, getKeyBuffer(), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted secret.
 */
export function decryptSecret(ciphertext: string): string {
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format. Expected iv:authTag:encrypted');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKeyBuffer(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Cryptographically verifies that SHA-256(preimage) equals the expected payment hash.
 * This ensures no settlement proof can be spoofed or accepted without true Lightning settlement.
 */
export function verifyPreimageHash(
  preimageHex: string,
  expectedPaymentHashHex: string
): boolean {
  if (!preimageHex || !expectedPaymentHashHex) return false;
  try {
    const cleanPreimage = preimageHex.trim().toLowerCase();
    const cleanExpected = expectedPaymentHashHex.trim().toLowerCase();

    // Verify valid 64-hex format
    if (!/^[0-9a-f]{64}$/.test(cleanPreimage) || !/^[0-9a-f]{64}$/.test(cleanExpected)) {
      return false;
    }

    const calculatedHash = crypto
      .createHash('sha256')
      .update(Buffer.from(cleanPreimage, 'hex'))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'hex'),
      Buffer.from(cleanExpected, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Safely extracts diagnostic metadata from an NWC connection URI without
 * ever exposing or logging the secret parameter.
 */
export function redactNwcUri(uri: string): { relayHost: string; pubkeyPrefix: string } {
  let pubkeyPrefix = 'unknown';
  let relayHost = 'unknown';

  try {
    const pubkeyMatch = uri.match(/nostr\+walletconnect:\/\/([0-9a-fA-F]{8})/i);
    if (pubkeyMatch) {
      pubkeyPrefix = pubkeyMatch[1];
    }
    const relayMatch = uri.match(/[?&]relay=([^&]+)/i);
    if (relayMatch) {
      const decoded = decodeURIComponent(relayMatch[1]);
      try {
        relayHost = new URL(decoded).host || decoded;
      } catch {
        relayHost = decoded;
      }
    }
  } catch {
    // Keep fallback defaults
  }

  return { relayHost, pubkeyPrefix };
}
