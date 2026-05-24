import { queryOne, runQuery, withTransaction, toCents, fromCents, nowISO } from '../db.js';

export async function createDeposit(userId: number, amountDollars: number, method: string, paymentDetails?: string) {
  const amountCents = toCents(amountDollars);
  const result = await runQuery(`
    INSERT INTO transactions (user_id, type, amount_cents, status, payment_method, payment_details, description)
    VALUES (?, 'deposit', ?, 'Pending', ?, ?, ?)
    RETURNING *
  `, [userId, amountCents, method, paymentDetails || null, `Deposit via ${method}`]);

  return result.rows[0];
}

export async function createWithdrawal(userId: number, amountDollars: number, method: string, destination: string) {
  const amountCents = toCents(amountDollars);

  // Validate sufficient balance
  const user = await queryOne(`SELECT balance_cents FROM users WHERE id = ?`, [userId]) as { balance_cents: number } | undefined;
  if (!user) throw new Error('User not found');
  if (user.balance_cents < amountCents) {
    throw new Error('Insufficient balance');
  }

  const result = await runQuery(`
    INSERT INTO transactions (user_id, type, amount_cents, status, payment_method, payment_details, description)
    VALUES (?, 'withdrawal', ?, 'Pending', ?, ?, ?)
    RETURNING *
  `, [userId, -amountCents, method, destination, `Withdrawal via ${method}`]);

  return result.rows[0];
}

export async function approveTransaction(txId: number, adminNotes?: string) {
  const tx = await queryOne(`SELECT * FROM transactions WHERE id = ?`, [txId]) as any;
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'Pending') throw new Error('Transaction is not pending');

  await withTransaction(async (client) => {
    // Update transaction
    await runQuery(`
      UPDATE transactions SET status = 'Approved', processed_at = ?, admin_notes = ?, updated_at = ?
      WHERE id = ?
    `, [nowISO(), adminNotes || null, nowISO(), txId], client);

    // Update user balance
    if (tx.type === 'deposit') {
      await runQuery(`UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?`, [tx.amount_cents, tx.user_id], client);
    } else if (tx.type === 'withdrawal') {
      // amount_cents is negative for withdrawals, so adding it reduces balance
      await runQuery(`UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?`, [tx.amount_cents, tx.user_id], client);
    }
  });

  return await queryOne(`SELECT * FROM transactions WHERE id = ?`, [txId]) as any;
}

export async function rejectTransaction(txId: number, adminNotes?: string) {
  const tx = await queryOne(`SELECT * FROM transactions WHERE id = ?`, [txId]) as any;
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'Pending') throw new Error('Transaction is not pending');

  await runQuery(`
    UPDATE transactions SET status = 'Rejected', admin_notes = ?, updated_at = ?
    WHERE id = ?
  `, [adminNotes || null, nowISO(), txId]);

  return await queryOne(`SELECT * FROM transactions WHERE id = ?`, [txId]) as any;
}

export async function createInvestment(userId: number, fundId: number, amountDollars: number) {
  const amountCents = toCents(amountDollars);

  const user = await queryOne(`SELECT balance_cents FROM users WHERE id = ?`, [userId]) as { balance_cents: number } | undefined;
  const fund = await queryOne(`SELECT * FROM funds WHERE id = ?`, [fundId]) as any;

  if (!fund) throw new Error('Fund not found');
  if (!user) throw new Error('User not found');
  if (user.balance_cents < amountCents) throw new Error('Insufficient balance');
  if (amountCents < fund.min_investment_cents) throw new Error(`Minimum investment is $${fromCents(fund.min_investment_cents)}`);
  if (fund.max_investment_cents && amountCents > fund.max_investment_cents) throw new Error(`Maximum investment is $${fromCents(fund.max_investment_cents)}`);

  await withTransaction(async (client) => {
    // Deduct balance
    await runQuery(`UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?`, [amountCents, userId], client);

    // Upsert holding
    const existing = await queryOne(`SELECT * FROM holdings WHERE user_id = ? AND fund_id = ?`, [userId, fundId], client) as any;
    if (existing) {
      await runQuery(`
        UPDATE holdings SET invested_cents = invested_cents + ?, current_cents = current_cents + ?, updated_at = ?
        WHERE id = ?
      `, [amountCents, amountCents, nowISO(), existing.id], client);
    } else {
      await runQuery(`
        INSERT INTO holdings (user_id, fund_id, invested_cents, current_cents)
        VALUES (?, ?, ?, ?)
      `, [userId, fundId, amountCents, amountCents], client);
    }

    // Create transaction
    await runQuery(`
      INSERT INTO transactions (user_id, type, amount_cents, status, description, fund_name)
      VALUES (?, 'investment', ?, 'Completed', ?, ?)
    `, [userId, -amountCents, `Investment in ${fund.name}`, fund.name], client);
  });

  const newBalance = fromCents((await queryOne(`SELECT balance_cents FROM users WHERE id = ?`, [userId]) as any)?.balance_cents || 0);
  const holding = await queryOne(`SELECT * FROM holdings WHERE user_id = ? AND fund_id = ?`, [userId, fundId]) as any;

  return { newBalance, holding };
}

export async function createDivestment(userId: number, holdingId: number, amountDollars: number) {
  const amountCents = toCents(amountDollars);

  const holding = await queryOne(`SELECT * FROM holdings WHERE id = ? AND user_id = ?`, [holdingId, userId]) as any;
  if (!holding) throw new Error('Holding not found');
  if (holding.current_cents < amountCents) throw new Error('Insufficient holding value');

  const fund = await queryOne(`SELECT name FROM funds WHERE id = ?`, [holding.fund_id]) as { name: string } | undefined;

  await withTransaction(async (client) => {
    // Add balance
    await runQuery(`UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?`, [amountCents, userId], client);

    // Update or delete holding
    const newCurrent = holding.current_cents - amountCents;
    const newInvested = Math.max(0, holding.invested_cents - (amountCents / holding.current_cents) * holding.invested_cents);

    if (newCurrent <= 1) {
      await runQuery(`DELETE FROM holdings WHERE id = ?`, [holdingId], client);
    } else {
      await runQuery(`
        UPDATE holdings SET invested_cents = ?, current_cents = ?, updated_at = ? WHERE id = ?
      `, [Math.round(newInvested), newCurrent, nowISO(), holdingId], client);
    }

    // Create transaction
    await runQuery(`
      INSERT INTO transactions (user_id, type, amount_cents, status, description, fund_name)
      VALUES (?, 'divestment', ?, 'Completed', ?, ?)
    `, [userId, amountCents, `Sale of ${fund?.name || 'fund'}`, fund?.name || null], client);
  });

  const newBalance = fromCents((await queryOne(`SELECT balance_cents FROM users WHERE id = ?`, [userId]) as any)?.balance_cents || 0);
  const updatedHolding = await queryOne(`SELECT * FROM holdings WHERE id = ?`, [holdingId]) as any | undefined;

  return { newBalance, holding: updatedHolding || null };
}

// Helper to format a transaction from DB row to API shape
export function formatTransaction(row: any) {
  return {
    id: String(row.id),
    date: row.created_at ? String(row.created_at).split(/[T ]/)[0] : row.created_at,
    type: row.type,
    description: row.description,
    fundName: row.fund_name,
    amount: fromCents(row.amount_cents),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentDetails: row.payment_details,
    adminNotes: row.admin_notes,
  };
}
