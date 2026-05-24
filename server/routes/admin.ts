import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { queryOne, queryMany, runQuery, fromCents, toCents } from '../db.js';
import { approveTransaction, rejectTransaction, formatTransaction } from '../services/transactionService.js';
import { sendTransactionStatusEmail } from '../services/emailService.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', async (_req, res) => {
  const totalUsers = ((await queryOne(`SELECT COUNT(*)::int as c FROM users`)) as any)?.c || 0;
  const pendingDeposits = ((await queryOne(`SELECT COUNT(*)::int as c FROM transactions WHERE status = 'Pending' AND type = 'deposit'`)) as any)?.c || 0;
  const pendingWithdrawals = ((await queryOne(`SELECT COUNT(*)::int as c FROM transactions WHERE status = 'Pending' AND type = 'withdrawal'`)) as any)?.c || 0;
  const totalTransactions = ((await queryOne(`SELECT COUNT(*)::int as c FROM transactions`)) as any)?.c || 0;
  const openTickets = ((await queryOne(`SELECT COUNT(*)::int as c FROM support_tickets WHERE status IN ('open', 'in_progress')`)) as any)?.c || 0;

  // Calculate total AUM from all holdings
  // PostgreSQL SUM returns bigint as string; parse to number to avoid string concatenation
  const totalHoldingsCents = Number(((await queryOne(`SELECT SUM(current_cents) as s FROM holdings`)) as any)?.s || 0);
  const totalCashCents = Number(((await queryOne(`SELECT SUM(balance_cents) as s FROM users`)) as any)?.s || 0);
  const totalAum = fromCents(totalHoldingsCents + totalCashCents);

  res.json({ totalUsers, totalAum, pendingDeposits, pendingWithdrawals, totalTransactions, openTickets });
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const search = (req.query.search as string) || '';
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;

  const users = await queryMany(`
    SELECT id, email, name, role, tier, kyc_status, balance_cents, created_at
    FROM users
    WHERE name ILIKE ? OR email ILIKE ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [`%${search}%`, `%${search}%`, limit, offset]) as any[];

  const total = ((await queryOne(`SELECT COUNT(*)::int as c FROM users WHERE name ILIKE ? OR email ILIKE ?`, [`%${search}%`, `%${search}%`])) as any)?.c || 0;

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
router.get('/transactions', async (req, res) => {
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

  const transactions = await queryMany(query, params) as any[];
  res.json({ transactions: transactions.map(formatTransaction) });
});

// POST /api/admin/transactions/:id/approve
const approveSchema = z.object({ adminNotes: z.string().optional() });

router.post('/transactions/:id/approve', validate(approveSchema), async (req, res) => {
  try {
    const tx = await approveTransaction(Number(req.params.id), req.body.adminNotes);
    const user = await queryOne(`SELECT * FROM users WHERE id = ?`, [tx.user_id]) as any;
    if (user) {
      sendTransactionStatusEmail(user.email, user.name, tx.type, tx.status, fromCents(tx.amount_cents), req.body.adminNotes).catch(console.error);
    }
    res.json({ transaction: formatTransaction(tx) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/admin/transactions/:id/reject
const rejectSchema = z.object({ adminNotes: z.string().optional() });

router.post('/transactions/:id/reject', validate(rejectSchema), async (req, res) => {
  try {
    const tx = await rejectTransaction(Number(req.params.id), req.body.adminNotes);
    const user = await queryOne(`SELECT * FROM users WHERE id = ?`, [tx.user_id]) as any;
    if (user) {
      sendTransactionStatusEmail(user.email, user.name, tx.type, tx.status, fromCents(tx.amount_cents), req.body.adminNotes).catch(console.error);
    }
    res.json({ transaction: formatTransaction(tx) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/admin/funds
router.get('/funds', async (_req, res) => {
  const funds = await queryMany(`SELECT * FROM funds ORDER BY created_at DESC`) as any[];
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

router.post('/funds', validate(fundSchema), async (req, res) => {
  const { slug, name, sector, description, minInvestment, targetYield, ytdReturn, aum, image } = req.body;
  const result = await runQuery(`
    INSERT INTO funds (slug, name, sector, description, min_investment_cents, target_yield, ytd_return, aum, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `, [slug, name, sector, description, toCents(minInvestment), targetYield, ytdReturn, aum, image]);

  const fund = result.rows[0];
  res.json({ fund });
});

// PUT /api/admin/funds/:id
router.put('/funds/:id', validate(fundSchema.partial()), async (req, res) => {
  const fund = await queryOne(`SELECT * FROM funds WHERE id = ?`, [req.params.id]) as any;
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
  await runQuery(`UPDATE funds SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);

  const updated = await queryOne(`SELECT * FROM funds WHERE id = ?`, [req.params.id]);
  res.json({ fund: updated });
});

// GET /api/admin/settings
router.get('/settings', async (_req, res) => {
  const rows = await queryMany(`SELECT key, value FROM platform_settings`) as any[];
  const settings: Record<string, any> = {};
  for (const r of rows) {
    try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
  }
  res.json({ settings });
});

// PUT /api/admin/settings
router.put('/settings', async (req, res) => {
  const { minDeposit, dailyWithdrawalLimit, fee, walletAddresses, bankDetails } = req.body;

  if (minDeposit !== undefined) {
    await runQuery(`INSERT INTO platform_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, ['min_deposit', String(minDeposit)]);
  }
  if (dailyWithdrawalLimit !== undefined) {
    await runQuery(`INSERT INTO platform_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, ['daily_withdrawal_limit', String(dailyWithdrawalLimit)]);
  }
  if (fee !== undefined) {
    await runQuery(`INSERT INTO platform_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, ['platform_fee', String(fee)]);
  }
  if (walletAddresses !== undefined) {
    await runQuery(`INSERT INTO platform_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, ['wallet_addresses', JSON.stringify(walletAddresses)]);
  }
  if (bankDetails !== undefined) {
    await runQuery(`INSERT INTO platform_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, ['bank_details', JSON.stringify(bankDetails)]);
  }

  res.json({ success: true });
});

// Support tickets admin endpoints
router.get('/support-tickets', async (_req, res) => {
  const tickets = await queryMany(`
    SELECT t.*, u.email, u.name
    FROM support_tickets t
    JOIN users u ON t.user_id = u.id
    ORDER BY CASE t.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'resolved' THEN 2 ELSE 3 END, t.created_at DESC
  `) as any[];
  res.json({ tickets: tickets.map(t => ({ id: t.id, userId: t.user_id, userEmail: t.email, userName: t.name, subject: t.subject, message: t.message, status: t.status, adminReply: t.admin_reply, createdAt: t.created_at, updatedAt: t.updated_at })) });
});

const ticketReplySchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  reply: z.string().optional(),
});

router.post('/support-tickets/:id/reply', validate(ticketReplySchema), async (req, res) => {
  const ticketId = Number(req.params.id);
  const { status, reply } = req.body;
  await runQuery(`UPDATE support_tickets SET status = ?, admin_reply = COALESCE(?, admin_reply), updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, reply || null, ticketId]);
  const ticket = await queryOne(`SELECT * FROM support_tickets WHERE id = ?`, [ticketId]) as any;
  res.json({ ticket: { id: ticket.id, subject: ticket.subject, status: ticket.status, adminReply: ticket.admin_reply, updatedAt: ticket.updated_at } });
});

export default router;
