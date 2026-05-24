import path from 'path';
import fs from 'fs';
import pg from 'pg';

const { Pool, types } = pg;

// Keep timestamps as strings to match existing SQLite behavior
// and avoid Date object formatting issues across the codebase.
types.setTypeParser(types.builtins.TIMESTAMP, (val) => val);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => val);

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'platform.db');

// Ensure data directory exists (only relevant for local dev when falling back)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://localhost:5432/cargilldb`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export { pool as db };

function toPgParams(sql: string, params?: any[]): { text: string; values: any[] } {
  if (!params || params.length === 0) return { text: sql, values: [] };
  let i = 0;
  const text = sql.replace(/\?/g, () => `$${++i}`);
  return { text, values: params };
}

export async function queryOne(sql: string, params?: any[], client?: pg.PoolClient): Promise<any | undefined> {
  const { text, values } = toPgParams(sql, params);
  const result = client ? await client.query(text, values) : await pool.query(text, values);
  return result.rows[0];
}

export async function queryMany(sql: string, params?: any[], client?: pg.PoolClient): Promise<any[]> {
  const { text, values } = toPgParams(sql, params);
  const result = client ? await client.query(text, values) : await pool.query(text, values);
  return result.rows;
}

export async function runQuery(sql: string, params?: any[], client?: pg.PoolClient): Promise<{ rowCount: number; rows: any[] }> {
  const { text, values } = toPgParams(sql, params);
  const result = client ? await client.query(text, values) : await pool.query(text, values);
  return { rowCount: result.rowCount || 0, rows: result.rows };
}

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function initSchema() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'investor' CHECK(role IN ('investor', 'admin')),
      tier INTEGER NOT NULL DEFAULT 0 CHECK(tier IN (0, 1, 2, 3)),
      kyc_status TEXT NOT NULL DEFAULT 'none' CHECK(kyc_status IN ('none', 'pending', 'verified')),
      balance_cents INTEGER NOT NULL DEFAULT 0,
      email_verified INTEGER NOT NULL DEFAULT 0,
      email_verification_token TEXT,
      password_reset_token TEXT,
      password_reset_expires TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS funds (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      sector TEXT NOT NULL,
      description TEXT NOT NULL,
      min_investment_cents INTEGER NOT NULL,
      max_investment_cents INTEGER,
      target_yield REAL NOT NULL,
      ytd_return REAL NOT NULL,
      aum TEXT NOT NULL,
      image TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS holdings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      fund_id INTEGER NOT NULL,
      invested_cents INTEGER NOT NULL DEFAULT 0,
      current_cents INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE CASCADE,
      UNIQUE(user_id, fund_id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('deposit','withdrawal','investment','divestment','dividend','fee')),
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Rejected','Completed')),
      payment_method TEXT,
      payment_details TEXT,
      description TEXT NOT NULL,
      fund_name TEXT,
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved','closed')),
      admin_reply TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      session_id TEXT UNIQUE NOT NULL,
      messages TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status, type);
    CREATE INDEX IF NOT EXISTS idx_transactions_pending ON transactions(status, type) WHERE status = 'Pending';
    CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings(user_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
  `);
}

// Money helpers: convert between cents (DB) and dollars (API)
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function nowISO(): string {
  return new Date().toISOString();
}
