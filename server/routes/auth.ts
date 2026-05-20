import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { authMiddleware, signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

function userToResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tier: user.tier,
    kycStatus: user.kyc_status,
    balance: user.balance_cents / 100,
  };
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.body;

  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, tier, kyc_status)
    VALUES (?, ?, ?, 'investor', 1, 'none')
  `).run(email, hash, name);

  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(result.lastInsertRowid);
  const token = signToken(user.id);
  res.json({ token, user: userToResponse(user) });
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as any;
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken(user.id);
  res.json({ token, user: userToResponse(user) });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.user!.id) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: userToResponse(user) });
});

export default router;
