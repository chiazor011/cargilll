import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Ollama Cloud configuration
// Set OLLAMA_BASE_URL to 'https://ollama.com' for Ollama Cloud
// Set OLLAMA_API_KEY to your Ollama Cloud API key
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'https://ollama.com';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'ministral-3:3b';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';

async function ollamaChat(messages: { role: string; content: string }[]) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (OLLAMA_API_KEY) {
    headers['Authorization'] = `Bearer ${OLLAMA_API_KEY}`;
  }

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.message?.content || '';
}

// POST /api/chatbot/message
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Retrieve or create session
    let session = db.prepare(`SELECT * FROM chat_sessions WHERE session_id = ?`).get(sessionId || '') as any;
    let messages: { role: string; content: string }[] = [];

    if (session) {
      messages = JSON.parse(session.messages);
    } else {
      // System prompt for Cargill support bot
      messages.push({
        role: 'system',
        content: `You are CargillBot, a helpful and knowledgeable support assistant for Cargill Institutional — an agricultural investment platform.

Key facts:
- Starter Agriculture Fund: $1,000 minimum
- Biofuels Initiative & Sustainable Cocoa Fund: $10,000 minimum
- Global Wheat Fund: $25,000 minimum
- Sustainable Harvest Fund: $50,000 minimum (max $100,000)
- Deposits can be made via crypto (BTC, ETH, USDT) or bank wire/ACH
- Withdrawals require admin approval
- Support tickets can be created via the Contact/Support page
- Users must verify their email after registration
- For urgent issues, advise creating a support ticket

Be concise, professional, and helpful. If unsure, direct the user to create a support ticket.`,
      });
    }

    messages.push({ role: 'user', content: message });

    const reply = await ollamaChat(messages);
    messages.push({ role: 'assistant', content: reply });

    // Save session
    const sid = sessionId || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const userId = (req as any).user?.id || null;
    db.prepare(`INSERT OR REPLACE INTO chat_sessions (session_id, user_id, messages) VALUES (?, ?, ?)`).run(sid, userId, JSON.stringify(messages));

    res.json({ reply, sessionId: sid });
  } catch (e: any) {
    console.error('[chatbot]', e);
    res.status(500).json({ error: 'Chatbot service unavailable. Please try again later or create a support ticket.' });
  }
});

export default router;
