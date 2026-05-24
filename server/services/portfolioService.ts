import { queryOne, queryMany, fromCents } from '../db.js';
import { formatTransaction } from './transactionService.js';

export async function getPortfolio(userId: number) {
  const user = await queryOne(`SELECT balance_cents FROM users WHERE id = ?`, [userId]) as { balance_cents: number } | undefined;
  if (!user) throw new Error('User not found');

  const holdings = await queryMany(`
    SELECT h.id, h.fund_id as "fundId", f.name as "fundName", f.sector, h.invested_cents, h.current_cents, f.ytd_return
    FROM holdings h JOIN funds f ON h.fund_id = f.id WHERE h.user_id = ?
  `, [userId]) as any[];

  const transactions = await queryMany(`
    SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC
  `, [userId]) as any[];

  return {
    balance: fromCents(user.balance_cents),
    holdings: holdings.map(h => ({
      id: String(h.id),
      fundId: String(h.fundId),
      fundName: h.fundName,
      sector: h.sector,
      investedAmount: fromCents(h.invested_cents),
      currentValue: fromCents(h.current_cents),
      ytdReturn: h.ytd_return,
    })),
    transactions: transactions.map(formatTransaction),
  };
}
