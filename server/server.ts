import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initSchema } from './db.js';
import { seed } from './seed.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import supportRoutes from './routes/support.js';
import chatbotRoutes from './routes/chatbot.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow Vite dev server inline scripts
}));
const isProd = process.env.NODE_ENV === 'production';
const ALLOWED_ORIGINS = [APP_URL, 'http://localhost:3000', 'http://0.0.0.0:3000', 'http://127.0.0.1:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (isProd || !origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', publicRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Static files + SPA catch-all (only in production or when dist exists)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler
app.use(errorHandler);

// Init DB + seed
initSchema();
seed().catch(console.error);

app.listen(PORT, () => {
  console.log(`[server] API running on http://localhost:${PORT}`);
  console.log(`[server] Frontend should be at ${APP_URL}`);
});
