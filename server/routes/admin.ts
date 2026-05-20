import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { db, fromCents, toCents } from '../db.js';
import { approveTransaction, rejectTransaction, formatTransaction } from '../services/transactionService.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', (_req, res) => {
  const totalUsers = (db.prepare(`SELECT COUNT(*) as c FROM users`).get() as any).c;
  const pendingDeposits = (db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE status = 'Pending' AND type = 'deposit'`).get() as any).c;
  const pendingWithdrawals = (db.prepare(`SELECT COUNT(*) as c FROM transactions WHERE status = 'Pending' AND type = 'withdrawal'`).get() as any).c;
  const totalTransactions = (db.prepare(`SELECT COUNT(*) as c FROM transactions`).get() as any).c;

  // Calculate total AUM from all holdings
  const totalHoldingsCents = (db.prepare(`SELECT SUM(current_cents) as s FROM holdings`).get() as any)?.s || 0;
  const totalCashCents = (db.prepare(`SELECT SUM(balance_cents) as s FROM users`).get() as any)?.s || 0;
  const totalAum = fromCents(totalHoldingsCents + totalCashCents);

  res.json({ totalUsers, totalAum, pendingDeposits, pendingWithdrawals, totalTransactions });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  const search = (req.query.search as string) || '';
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;

  const users = db.prepare(`
    SELECT id, email, name, role, tier, kyc_status, balance_cents, created_at
    FROM users
    WHERE name LIKE ? OR email LIKE ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(`%${search}%`, `%${search}%`, limit, offset) as any[];

  const total = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE name LIKE ? OR email LIKE ?`).get(`%${search}%`, `%${search}%`) as any).c;

  res.json({
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      tier: u.tier,
      kycStatus: u.kyc_status,
      balance: fromCents(u.balance_cents),
      createdAt: u.created_at,
    })),
    total,
  });
});

// GET /api/admin/transactions
router.get('/transactions', (req, res) => {
  const type = req.query.type as string || '';
  const status = req.query.status as string || '';
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;

  let query = `SELECT t.*, u.email as user_email, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id WHERE 1=1`;
  const params: any[] = [];

  if (type) { query += ` AND t.type = ?`; params.push(type); }
  if (status) { query += ` AND t.status = ?`; params.push(status); }
  query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const transactions = db.prepare(query).all(...params) as any[];
  res.json({ transactions: transactions.map(formatTransaction) });
});

// POST /api/admin/transactions/:id/approve
const approveSchema = z.object({ adminNotes: z.string().optional() });

router.post('/transactions/:id/approve', validate(approveSchema), (req, res) => {
  try {
    const tx = approveTransaction(Number(req.params.id), req.body.adminNotes);
    res.json({ transaction: formatTransaction(tx) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/admin/transactions/:id/reject
const rejectSchema = z.object({ adminNotes: z.string().optional() });

router.post('/transactions/:id/reject', validate(rejectSchema), (req, res) => {
  try {
    const tx = rejectTransaction(Number(req.params.id), req.body.adminNotes);
    res.json({ transaction: formatTransaction(tx) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/admin/funds
router.get('/funds', (_req, res) => {
  const funds = db.prepare(`SELECT * FROM funds ORDER BY created_at DESC`).all() as any[];
  res.json({ funds });
});

// POST /api/admin/funds
const fundSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  sector: z.string().min(1),
  description: z.string().min(1),
  minInvestment: z.number().positive(),
  targetYield: z.number().positive(),
  ytdReturn: z.number(),
  aum: z.string().min(1),
  image: z.string().min(1),
});

router.post('/funds', validate(fundSchema), (req, res) => {
  const { slug, name, sector, description, minInvestment, targetYield, ytdReturn, aum, image } = req.body;
  const result = db.prepare(`
    INSERT INTO funds (slug, name, sector, description, min_investment_cents, target_yield, ytd_return, aum, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(slug, name, sector, description, toCents(minInvestment), targetYield, ytdReturn, aum, image);

  const fund = db.prepare(`SELECT * FROM funds WHERE id = ?`).get(result.lastInsertRowid);
  res.json({ fund });
});

// PUT /api/admin/funds/:id
router.put('/funds/:id', validate(fundSchema.partial()), (req, res) => {
  const fund = db.prepare(`SELECT * FROM funds WHERE id = ?`).get(req.params.id) as any;
  if (!fund) {
    res.status(404).json({ error: 'Fund not found' });
    return;
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (req.body.name) { updates.push('name = ?'); values.push(req.body.name); }
  if (req.body.sector) { updates.push('sector = ?'); values.push(req.body.sector); }
  if (req.body.description) { updates.push('description = ?'); values.push(req.body.description); }
  if (req.body.minInvestment) { updates.push('min_investment_cents = ?'); values.push(toCents(req.body.minInvestment)); }
  if (req.body.targetYield) { updates.push('target_yield = ?'); values.push(req.body.targetYield); }
  if (req.body.ytdReturn !== undefined) { updates.push('ytd_return = ?'); values.push(req.body.ytdReturn); }
  if (req.body.aum) { updates.push('aum = ?'); values.push(req.body.aum); }
  if (req.body.image) { updates.push('image = ?'); values.push(req.body.image); }
  if (req.body.isActive !== undefined) { updates.push('is_active = ?'); values.push(req.body.isActive ? 1 : 0); }

  if (updates.length === 0) {
    res.json({ fund });
    return;
  }

  values.push(req.params.id);
  db.prepare(`UPDATE funds SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);

  const updated = db.prepare(`SELECT * FROM funds WHERE id = ?`).get(req.params.id);
  res.json({ fund: updated });
});

// GET /api/admin/settings
router.get('/settings', (_req, res) => {
  const rows = db.prepare(`SELECT key, value FROM platform_settings`).all() as any[];
  const settings: Record<string, any> = {};
  for (const r of rows) {
    try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
  }
  res.json({ settings });
});

// PUT /api/admin/settings
router.put('/settings', (req, res) => {
  const { minDeposit, dailyWithdrawalLimit, fee, walletAddresses, bankDetails } = req.body;

  const stmt = db.prepare(`INSERT OR REPLACE INTO platform_settings (key, value) VALUES (?, ?)`);
  if (minDeposit !== undefined) stmt.run('min_deposit', String(minDeposit));
  if (dailyWithdrawalLimit !== undefined) stmt.run('daily_withdrawal_limit', String(dailyWithdrawalLimit));
  if (fee !== undefined) stmt.run('platform_fee', String(fee));
  if (walletAddresses !== undefined) stmt.run('wallet_addresses', JSON.stringify(walletAddresses));
  if (bankDetails !== undefined) stmt.run('bank_details', JSON.stringify(bankDetails));

  res.json({ success: true });
});

export default router;
