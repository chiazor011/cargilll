import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { queryOne, queryMany, runQuery } from '../db.js';
import { sendSupportTicketConfirmation } from '../services/emailService.js';

const router = Router();

const createTicketSchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

// POST /api/support/tickets - create a support ticket (auth required)
router.post('/tickets', authMiddleware, validate(createTicketSchema), async (req, res) => {
  const { subject, message } = req.body;
  const userId = req.user!.id;

  const result = await runQuery(`
    INSERT INTO support_tickets (user_id, subject, message, status)
    VALUES (?, ?, ?, 'open')
    RETURNING *
  `, [userId, subject, message]);

  const ticket = result.rows[0];
  const user = await queryOne(`SELECT * FROM users WHERE id = ?`, [userId]) as any;
  sendSupportTicketConfirmation(user.email, user.name, ticket.id, subject).catch(console.error);

  res.json({ ticket: { id: ticket.id, subject: ticket.subject, message: ticket.message, status: ticket.status, createdAt: ticket.created_at } });
});

// GET /api/support/tickets - get user's own tickets
router.get('/tickets', authMiddleware, async (req, res) => {
  const userId = req.user!.id;
  const tickets = await queryMany(`
    SELECT id, subject, message, status, admin_reply, created_at, updated_at
    FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC
  `, [userId]) as any[];

  res.json({
    tickets: tickets.map(t => ({
      id: t.id,
      subject: t.subject,
      message: t.message,
      status: t.status,
      adminReply: t.admin_reply,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    })),
  });
});

// GET /api/support/tickets/all - admin only, all tickets
router.get('/tickets/all', authMiddleware, async (req, res) => {
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const tickets = await queryMany(`
    SELECT t.*, u.email, u.name
    FROM support_tickets t
    JOIN users u ON t.user_id = u.id
    ORDER BY CASE t.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'resolved' THEN 2 ELSE 3 END, t.created_at DESC
  `) as any[];

  res.json({
    tickets: tickets.map(t => ({
      id: t.id,
      userId: t.user_id,
      userEmail: t.email,
      userName: t.name,
      subject: t.subject,
      message: t.message,
      status: t.status,
      adminReply: t.admin_reply,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    })),
  });
});

// POST /api/support/tickets/:id/reply - admin reply to ticket
const replySchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  reply: z.string().optional(),
});

router.post('/tickets/:id/reply', authMiddleware, validate(replySchema), async (req, res) => {
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const ticketId = Number(req.params.id);
  const { status, reply } = req.body;

  await runQuery(`UPDATE support_tickets SET status = ?, admin_reply = COALESCE(?, admin_reply), updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, reply || null, ticketId]);

  const ticket = await queryOne(`SELECT * FROM support_tickets WHERE id = ?`, [ticketId]) as any;
  res.json({ ticket: { id: ticket.id, subject: ticket.subject, status: ticket.status, adminReply: ticket.admin_reply, updatedAt: ticket.updated_at } });
});

export default router;
