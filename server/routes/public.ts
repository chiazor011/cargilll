import { Router } from 'express';
import { queryOne, queryMany } from '../db.js';

const router = Router();

router.get('/funds', async (_req, res) => {
  const funds = await queryMany(`
    SELECT id, slug, name, sector, description, min_investment_cents as "minInvestment", max_investment_cents as "maxInvestment", target_yield as "targetYield", ytd_return as "ytdReturn", aum, image
    FROM funds WHERE is_active = 1
  `) as any[];

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

router.get('/platform/crypto-addresses', async (_req, res) => {
  const row = await queryOne(`SELECT value FROM platform_settings WHERE key = ?`, ['wallet_addresses']) as { value: string } | undefined;
  if (!row) {
    res.json({ addresses: [] });
    return;
  }
  res.json({ addresses: JSON.parse(row.value) });
});

router.get('/platform/bank-details', async (_req, res) => {
  const row = await queryOne(`SELECT value FROM platform_settings WHERE key = ?`, ['bank_details']) as { value: string } | undefined;
  if (!row) {
    res.json({ wire: null, ach: null });
    return;
  }
  res.json(JSON.parse(row.value));
});

export default router;
