import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { queryOne, runQuery } from '../db.js';
import { authMiddleware, signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

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

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
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
    emailVerified: !!user.email_verified,
  };
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await queryOne(`SELECT id FROM users WHERE email = ?`, [email]);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const result = await runQuery(`
    INSERT INTO users (email, password_hash, name, role, tier, kyc_status, email_verification_token)
    VALUES (?, ?, ?, 'investor', 1, 'none', ?)
    RETURNING *
  `, [email, hash, name, verificationToken]);

  const user = result.rows[0];
  const token = signToken(user.id);

  // Send emails in background
  sendWelcomeEmail(email, name).catch(console.error);
  sendVerificationEmail(email, name, verificationToken).catch(console.error);

  res.json({ token, user: userToResponse(user) });
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await queryOne(`SELECT * FROM users WHERE email = ?`, [email]) as any;
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

router.get('/me', authMiddleware, async (req, res) => {
  const user = await queryOne(`SELECT * FROM users WHERE id = ?`, [req.user!.id]) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: userToResponse(user) });
});

// Verify email
router.get('/verify-email', async (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ error: 'Token required' });
    return;
  }

  const user = await queryOne(`SELECT * FROM users WHERE email_verification_token = ?`, [token]) as any;
  if (!user) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }

  await runQuery(`UPDATE users SET email_verified = 1, email_verification_token = NULL WHERE id = ?`, [user.id]);
  res.json({ success: true, message: 'Email verified successfully' });
});

// Resend verification email
router.post('/resend-verification', authMiddleware, async (req, res) => {
  const user = await queryOne(`SELECT * FROM users WHERE id = ?`, [req.user!.id]) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (user.email_verified) {
    res.status(400).json({ error: 'Email already verified' });
    return;
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  await runQuery(`UPDATE users SET email_verification_token = ? WHERE id = ?`, [verificationToken, user.id]);
  sendVerificationEmail(user.email, user.name, verificationToken).catch(console.error);
  res.json({ success: true });
});

// Forgot password
router.post('/forgot-password', validate(forgotSchema), async (req, res) => {
  const { email } = req.body;
  const user = await queryOne(`SELECT * FROM users WHERE email = ?`, [email]) as any;
  if (!user) {
    res.status(200).json({ success: true, message: 'If an account exists, a reset email has been sent.' });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await runQuery(`UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?`, [resetToken, expires, user.id]);
  sendPasswordResetEmail(user.email, user.name, resetToken).catch(console.error);
  res.json({ success: true, message: 'If an account exists, a reset email has been sent.' });
});

// Reset password
router.post('/reset-password', validate(resetSchema), async (req, res) => {
  const { token, password } = req.body;
  const user = await queryOne(`SELECT * FROM users WHERE password_reset_token = ?`, [token]) as any;
  if (!user) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }
  if (new Date(user.password_reset_expires) < new Date()) {
    res.status(400).json({ error: 'Token has expired' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await runQuery(`UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?`, [hash, user.id]);
  res.json({ success: true, message: 'Password reset successfully' });
});

export default router;
