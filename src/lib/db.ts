import { neon } from '@neondatabase/serverless';
import CryptoJS from 'crypto-js';

// Neon serverless connection
export const sql = neon(process.env.DATABASE_URL!);

// Encryption helpers for coupon codes
const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || 'tradeoff-default-key-change-in-prod';

export function encryptCode(code: string): string {
  return CryptoJS.AES.encrypt(code, ENCRYPTION_KEY).toString();
}

export function decryptCode(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
