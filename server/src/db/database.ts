import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Ensure directory exists
const dbPath = path.resolve(process.cwd(), env.SQLITE_DB_PATH);
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: Database.Database = new Database(dbPath);

// Enable Write-Ahead Logging (WAL) for high-performance concurrent reads & durability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase(): void {
  logger.info(`Initializing SQLite database at ${dbPath}`);

  db.exec(`
    -- 1. Singleton Wallet Configuration table
    CREATE TABLE IF NOT EXISTS wallet_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      encrypted_nwc_uri TEXT NOT NULL,
      relay_host TEXT NOT NULL,
      pubkey_prefix TEXT NOT NULL,
      supported_methods TEXT NOT NULL,
      has_pay_permission INTEGER NOT NULL DEFAULT 0,
      connected_at TEXT NOT NULL
    );

    -- 2. Merchant Lightning Invoices & Settlement State table
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      amount_xof INTEGER,
      amount_sats INTEGER NOT NULL,
      amount_msats INTEGER NOT NULL,
      rate_xof_per_btc REAL,
      rate_source TEXT NOT NULL,
      bolt11 TEXT NOT NULL,
      payment_hash TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL,
      preimage_verified INTEGER NOT NULL DEFAULT 0,
      announcement_played INTEGER NOT NULL DEFAULT 0,
      language TEXT NOT NULL DEFAULT 'fr',
      created_at TEXT NOT NULL,
      expires_at TEXT,
      settled_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_invoices_payment_hash ON invoices(payment_hash);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

    -- 3. Security Audit Logs (Zero PII, records adversarial attempts & rate fallbacks)
    CREATE TABLE IF NOT EXISTS security_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      invoice_id TEXT,
      payment_hash_prefix TEXT,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  logger.info('Database schema verified.');
}

// Interfaces
export interface DbWalletConfig {
  id: number;
  encrypted_nwc_uri: string;
  relay_host: string;
  pubkey_prefix: string;
  supported_methods: string; // JSON array
  has_pay_permission: number; // 0 or 1
  connected_at: string;
}

export interface DbInvoice {
  id: string;
  amount_xof: number | null;
  amount_sats: number;
  amount_msats: number;
  rate_xof_per_btc: number | null;
  rate_source: string;
  bolt11: string;
  payment_hash: string;
  status: string;
  preimage_verified: number; // 0 or 1
  announcement_played: number; // 0 or 1
  language: string;
  created_at: string;
  expires_at: string | null;
  settled_at: string | null;
}

export interface DbSecurityAuditLog {
  id: number;
  event_type: string;
  invoice_id: string | null;
  payment_hash_prefix: string | null;
  reason: string;
  created_at: string;
}

// DB Access Methods
export const dbQueries = {
  getWalletConfig: (): DbWalletConfig | undefined => {
    const stmt = db.prepare('SELECT * FROM wallet_config WHERE id = 1');
    return stmt.get() as DbWalletConfig | undefined;
  },

  saveWalletConfig: (params: {
    encrypted_nwc_uri: string;
    relay_host: string;
    pubkey_prefix: string;
    supported_methods: string[];
    has_pay_permission: boolean;
  }): void => {
    const stmt = db.prepare(`
      INSERT INTO wallet_config (
        id, encrypted_nwc_uri, relay_host, pubkey_prefix, supported_methods, has_pay_permission, connected_at
      ) VALUES (
        1, @encrypted_nwc_uri, @relay_host, @pubkey_prefix, @supported_methods, @has_pay_permission, @connected_at
      )
      ON CONFLICT(id) DO UPDATE SET
        encrypted_nwc_uri = excluded.encrypted_nwc_uri,
        relay_host = excluded.relay_host,
        pubkey_prefix = excluded.pubkey_prefix,
        supported_methods = excluded.supported_methods,
        has_pay_permission = excluded.has_pay_permission,
        connected_at = excluded.connected_at
    `);

    stmt.run({
      encrypted_nwc_uri: params.encrypted_nwc_uri,
      relay_host: params.relay_host,
      pubkey_prefix: params.pubkey_prefix,
      supported_methods: JSON.stringify(params.supported_methods),
      has_pay_permission: params.has_pay_permission ? 1 : 0,
      connected_at: new Date().toISOString(),
    });
  },

  clearWalletConfig: (): void => {
    const stmt = db.prepare('DELETE FROM wallet_config WHERE id = 1');
    stmt.run();
  },

  insertInvoice: (invoice: {
    id: string;
    amount_xof: number | null;
    amount_sats: number;
    amount_msats: number;
    rate_xof_per_btc: number | null;
    rate_source: string;
    bolt11: string;
    payment_hash: string;
    status: string;
    language?: string;
    expires_at?: string;
  }): void => {
    const stmt = db.prepare(`
      INSERT INTO invoices (
        id, amount_xof, amount_sats, amount_msats, rate_xof_per_btc, rate_source,
        bolt11, payment_hash, status, preimage_verified, announcement_played,
        language, created_at, expires_at
      ) VALUES (
        @id, @amount_xof, @amount_sats, @amount_msats, @rate_xof_per_btc, @rate_source,
        @bolt11, @payment_hash, @status, 0, 0,
        @language, @created_at, @expires_at
      )
    `);

    stmt.run({
      id: invoice.id,
      amount_xof: invoice.amount_xof,
      amount_sats: invoice.amount_sats,
      amount_msats: invoice.amount_msats,
      rate_xof_per_btc: invoice.rate_xof_per_btc,
      rate_source: invoice.rate_source,
      bolt11: invoice.bolt11,
      payment_hash: invoice.payment_hash,
      status: invoice.status,
      language: invoice.language || 'fr',
      created_at: new Date().toISOString(),
      expires_at: invoice.expires_at || null,
    });
  },

  getInvoiceById: (id: string): DbInvoice | undefined => {
    const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?');
    return stmt.get(id) as DbInvoice | undefined;
  },

  getInvoiceByPaymentHash: (paymentHash: string): DbInvoice | undefined => {
    const stmt = db.prepare('SELECT * FROM invoices WHERE payment_hash = ?');
    return stmt.get(paymentHash) as DbInvoice | undefined;
  },

  updateInvoiceSettled: (
    id: string,
    settledAt?: string,
    preimageVerified: boolean = true
  ): boolean => {
    // Atomic concurrency lock: changes === 1 only if invoice is UNPAID or PENDING
    const stmt = db.prepare(`
      UPDATE invoices
      SET status = 'PAID',
          preimage_verified = @preimage_verified,
          settled_at = @settled_at
      WHERE id = @id AND status IN ('UNPAID', 'PENDING')
    `);
    const result = stmt.run({
      id,
      settled_at: settledAt || new Date().toISOString(),
      preimage_verified: preimageVerified ? 1 : 0,
    });
    return result.changes === 1;
  },

  updateInvoiceExpired: (id: string): boolean => {
    const stmt = db.prepare(`
      UPDATE invoices
      SET status = 'EXPIRED'
      WHERE id = ? AND status IN ('UNPAID', 'PENDING')
    `);
    const result = stmt.run(id);
    return result.changes === 1;
  },

  ackInvoiceAudio: (id: string): boolean => {
    const stmt = db.prepare(`
      UPDATE invoices
      SET announcement_played = 1
      WHERE id = ? AND announcement_played = 0
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  },

  getRecentInvoices: (limit = 50): DbInvoice[] => {
    const stmt = db.prepare(`
      SELECT * FROM invoices
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit) as DbInvoice[];
  },

  getTodayVerifiedTotals: (): { totalXof: number; totalSats: number; count: number } => {
    // Current UTC date prefix YYYY-MM-DD
    const todayPrefix = new Date().toISOString().slice(0, 10);
    const stmt = db.prepare(`
      SELECT 
        COALESCE(SUM(amount_xof), 0) AS totalXof,
        COALESCE(SUM(amount_sats), 0) AS totalSats,
        COUNT(*) AS count
      FROM invoices
      WHERE status = 'PAID' AND created_at LIKE ?
    `);
    const row = stmt.get(`${todayPrefix}%`) as { totalXof: number; totalSats: number; count: number };
    return row || { totalXof: 0, totalSats: 0, count: 0 };
  },

  insertSecurityAuditLog: (params: {
    event_type: string;
    invoice_id?: string;
    payment_hash_prefix?: string;
    reason: string;
  }): void => {
    const stmt = db.prepare(`
      INSERT INTO security_audit_logs (event_type, invoice_id, payment_hash_prefix, reason, created_at)
      VALUES (@event_type, @invoice_id, @payment_hash_prefix, @reason, @created_at)
    `);
    stmt.run({
      event_type: params.event_type,
      invoice_id: params.invoice_id || null,
      payment_hash_prefix: params.payment_hash_prefix || null,
      reason: params.reason,
      created_at: new Date().toISOString(),
    });
  },

  getSecurityAuditLogs: (limit = 50): DbSecurityAuditLog[] => {
    const stmt = db.prepare(`
      SELECT * FROM security_audit_logs
      ORDER BY id DESC
      LIMIT ?
    `);
    return stmt.all(limit) as DbSecurityAuditLog[];
  },
};
