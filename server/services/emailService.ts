import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cargill-institutional.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[email] SMTP not configured. Emails will be logged to console.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function send(to: string, subject: string, html: string, text: string) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] Would send to ${to}:\nSubject: ${subject}\nText: ${text}\n`);
    return;
  }
  try {
    await t.sendMail({ from: `"Cargill Institutional" <${FROM_EMAIL}>`, to, subject, html, text });
  } catch (e) {
    console.error('[email] Send failed:', e);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  const subject = 'Welcome to Cargill Institutional';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f8b44;">Welcome, ${name}</h2>
      <p>Thank you for registering with <strong>Cargill Institutional</strong>. Your account has been created successfully.</p>
      <p>You can now access your portfolio, explore investment opportunities, and manage your allocations across global agricultural markets.</p>
      <a href="${APP_URL}" style="display: inline-block; background: #0f8b44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Access Your Account</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">If you did not create this account, please contact support immediately.</p>
    </div>
  `;
  const text = `Welcome, ${name}!\n\nThank you for registering with Cargill Institutional. Your account has been created successfully.\n\nAccess your account: ${APP_URL}`;
  await send(to, subject, html, text);
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const subject = 'Verify Your Email Address';
  const link = `${APP_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f8b44;">Verify Your Email</h2>
      <p>Hi ${name},</p>
      <p>Please confirm your email address by clicking the link below:</p>
      <a href="${link}" style="display: inline-block; background: #0f8b44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Verify Email Address</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    </div>
  `;
  const text = `Hi ${name},\n\nPlease confirm your email address by visiting:\n${link}\n\nThis link expires in 24 hours.`;
  await send(to, subject, html, text);
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const subject = 'Password Reset Request';
  const link = `${APP_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f8b44;">Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <a href="${link}" style="display: inline-block; background: #0f8b44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Reset Password</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
  const text = `Hi ${name},\n\nReset your password here:\n${link}\n\nThis link expires in 1 hour.`;
  await send(to, subject, html, text);
}

export async function sendTransactionStatusEmail(to: string, name: string, type: string, status: string, amount: number, adminNotes?: string) {
  const subject = `Your ${type} has been ${status}`;
  const sign = type === 'deposit' && status === 'Approved' ? '+' : type === 'withdrawal' && status === 'Approved' ? '-' : '';
  const notes = adminNotes ? `<p style="color: #666; font-size: 13px;">Admin note: ${adminNotes}</p>` : '';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${status === 'Approved' ? '#0f8b44' : '#dc2626'};">Transaction ${status}</h2>
      <p>Hi ${name},</p>
      <p>Your <strong>${type}</strong> of <strong>${sign}$${Math.abs(amount).toLocaleString()}</strong> has been <strong>${status}</strong>.</p>
      ${notes}
      <p style="margin-top: 24px;"><a href="${APP_URL}" style="display: inline-block; background: #0f8b44; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Portfolio</a></p>
    </div>
  `;
  const text = `Hi ${name},\n\nYour ${type} of $${Math.abs(amount).toLocaleString()} has been ${status}.\n\nView your portfolio: ${APP_URL}`;
  await send(to, subject, html, text);
}

export async function sendSupportTicketConfirmation(to: string, name: string, ticketId: number, subject: string) {
  const emailSubject = 'Support Ticket Received';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f8b44;">Ticket #${ticketId} Received</h2>
      <p>Hi ${name},</p>
      <p>We have received your support request regarding <strong>${subject}</strong>.</p>
      <p>Our team will review it and get back to you shortly.</p>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">Ticket ID: #${ticketId}</p>
    </div>
  `;
  const text = `Hi ${name},\n\nWe received your support request (#${ticketId}): ${subject}. Our team will get back to you shortly.`;
  await send(to, emailSubject, html, text);
}
