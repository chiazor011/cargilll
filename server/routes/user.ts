import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getPortfolio } from '../services/portfolioService.js';
import { createDeposit, createWithdrawal, createInvestment, createDivestment, formatTransaction } from '../services/transactionService.js';

const router = Router();

router.use(authMiddleware);

// GET /api/user/portfolio
router.get('/portfolio', (req, res) => {
  try {
    const portfolio = getPortfolio(req.user!.id);
    res.json(portfolio);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/user/deposits
const depositSchema = z.object({
  amount: z.number().positive().min(1000),
  method: z.string().min(1),
  paymentDetails: z.string().optional(),
});

router.post('/deposits', validate(depositSchema), (req, res) => {
  try {
    const tx = createDeposit(req.user!.id, req.body.amount, req.body.method, req.body.paymentDetails);
    res.json({ transaction: formatTransaction(tx) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/user/withdrawals
const withdrawalSchema = z.object({
  amount: z.number().positive().min(1000),
  method: z.string().min(1),
  destination: z.string().min(1),
});

router.post('/withdrawals', validate(withdrawalSchema), (req, res) => {
  try {
    const tx = createWithdrawal(req.user!.id, req.body.amount, req.body.method, req.body.destination);
    res.json({ transaction: formatTransaction(tx) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/user/investments
const investSchema = z.object({
  fundId: z.coerce.number().positive(),
  amount: z.number().positive(),
});

router.post('/investments', validate(investSchema), (req, res) => {
  try {
    const result = createInvestment(req.user!.id, req.body.fundId, req.body.amount);
    res.json({
      newBalance: result.newBalance,
      holding: result.holding ? {
        id: String(result.holding.id),
        fundId: String(result.holding.fund_id),
        fundName: (req as any).fundName,
        sector: '',
        investedAmount: result.holding.invested_cents / 100,
        currentValue: result.holding.current_cents / 100,
        ytdReturn: 0,
      } : null,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/user/divestments
const divestSchema = z.object({
  holdingId: z.coerce.number().positive(),
  amount: z.number().positive(),
});

router.post('/divestments', validate(divestSchema), (req, res) => {
  try {
    const result = createDivestment(req.user!.id, req.body.holdingId, req.body.amount);
    res.json({
      newBalance: result.newBalance,
      holding: result.holding ? {
        id: String(result.holding.id),
        fundId: String(result.holding.fund_id),
        fundName: '',
        sector: '',
        investedAmount: result.holding.invested_cents / 100,
        currentValue: result.holding.current_cents / 100,
        ytdReturn: 0,
      } : null,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
