import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/funds', (_req, res) => {
  const funds = db.prepare(`
    SELECT id, slug, name, sector, description, min_investment_cents as minInvestment, max_investment_cents as maxInvestment, target_yield as targetYield, ytd_return as ytdReturn, aum, image
    FROM funds WHERE is_active = 1
  `).all() as any[];

  res.json({
    funds: funds.map(f => ({
      id: f.slug,
      dbId: f.id,
      name: f.name,
      sector: f.sector,
      description: f.description,
      minInvestment: f.minInvestment / 100,
      maxInvestment: f.maxInvestment ? f.maxInvestment / 100 : undefined,
      targetYield: f.targetYield,
      ytdReturn: f.ytdReturn,
      aum: f.aum,
      image: f.image,
    })),
  });
});

router.get('/platform/crypto-addresses', (_req, res) => {
  const row = db.prepare(`SELECT value FROM platform_settings WHERE key = ?`).get('wallet_addresses') as { value: string } | undefined;
  if (!row) {
    res.json({ addresses: [] });
    return;
  }
  res.json({ addresses: JSON.parse(row.value) });
});

router.get('/platform/bank-details', (_req, res) => {
  const row = db.prepare(`SELECT value FROM platform_settings WHERE key = ?`).get('bank_details') as { value: string } | undefined;
  if (!row) {
    res.json({ wire: null, ach: null });
    return;
  }
  res.json(JSON.parse(row.value));
});

export default router;
