import { db, toCents, fromCents, nowISO } from '../db.js';

export function createDeposit(userId: number, amountDollars: number, method: string, paymentDetails?: string) {
  const amountCents = toCents(amountDollars);
  const tx = db.prepare(`
    INSERT INTO transactions (user_id, type, amount_cents, status, payment_method, payment_details, description)
    VALUES (?, 'deposit', ?, 'Pending', ?, ?, ?)
  `).run(userId, amountCents, method, paymentDetails || null, `Deposit via ${method}`);

  return db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(tx.lastInsertRowid) as any;
}

export function createWithdrawal(userId: number, amountDollars: number, method: string, destination: string) {
  const amountCents = toCents(amountDollars);

  // Validate sufficient balance
  const user = db.prepare(`SELECT balance_cents FROM users WHERE id = ?`).get(userId) as { balance_cents: number };
  if (user.balance_cents < amountCents) {
    throw new Error('Insufficient balance');
  }

  const tx = db.prepare(`
    INSERT INTO transactions (user_id, type, amount_cents, status, payment_method, payment_details, description)
    VALUES (?, 'withdrawal', ?, 'Pending', ?, ?, ?)
  `).run(userId, -amountCents, method, destination, `Withdrawal via ${method}`);

  return db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(tx.lastInsertRowid) as any;
}

export function approveTransaction(txId: number, adminNotes?: string) {
  const tx = db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(txId) as any;
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'Pending') throw new Error('Transaction is not pending');

  db.prepare(`BEGIN`).run();
  try {
    // Update transaction
    db.prepare(`
      UPDATE transactions SET status = 'Approved', processed_at = ?, admin_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(nowISO(), adminNotes || null, nowISO(), txId);

    // Update user balance
    if (tx.type === 'deposit') {
      db.prepare(`UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?`).run(tx.amount_cents, tx.user_id);
    } else if (tx.type === 'withdrawal') {
      // amount_cents is negative for withdrawals, so adding it reduces balance
      db.prepare(`UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?`).run(tx.amount_cents, tx.user_id);
    }

    db.prepare(`COMMIT`).run();
  } catch (e) {
    db.prepare(`ROLLBACK`).run();
    throw e;
  }

  return db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(txId) as any;
}

export function rejectTransaction(txId: number, adminNotes?: string) {
  const tx = db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(txId) as any;
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'Pending') throw new Error('Transaction is not pending');

  db.prepare(`
    UPDATE transactions SET status = 'Rejected', admin_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(adminNotes || null, nowISO(), txId);

  return db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(txId) as any;
}

export function createInvestment(userId: number, fundId: number, amountDollars: number) {
  const amountCents = toCents(amountDollars);

  const user = db.prepare(`SELECT balance_cents FROM users WHERE id = ?`).get(userId) as { balance_cents: number };
  const fund = db.prepare(`SELECT * FROM funds WHERE id = ?`).get(fundId) as any;

  if (!fund) throw new Error('Fund not found');
  if (user.balance_cents < amountCents) throw new Error('Insufficient balance');
  if (amountCents < fund.min_investment_cents) throw new Error(`Minimum investment is $${fromCents(fund.min_investment_cents)}`);
  if (fund.max_investment_cents && amountCents > fund.max_investment_cents) throw new Error(`Maximum investment is $${fromCents(fund.max_investment_cents)}`);

  db.prepare(`BEGIN`).run();
  try {
    // Deduct balance
    db.prepare(`UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?`).run(amountCents, userId);

    // Upsert holding
    const existing = db.prepare(`SELECT * FROM holdings WHERE user_id = ? AND fund_id = ?`).get(userId, fundId) as any;
    if (existing) {
      db.prepare(`
        UPDATE holdings SET invested_cents = invested_cents + ?, current_cents = current_cents + ?, updated_at = ?
        WHERE id = ?
      `).run(amountCents, amountCents, nowISO(), existing.id);
    } else {
      db.prepare(`
        INSERT INTO holdings (user_id, fund_id, invested_cents, current_cents)
        VALUES (?, ?, ?, ?)
      `).run(userId, fundId, amountCents, amountCents);
    }

    // Create transaction
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount_cents, status, description, fund_name)
      VALUES (?, 'investment', ?, 'Completed', ?, ?)
    `).run(userId, -amountCents, `Investment in ${fund.name}`, fund.name);

    db.prepare(`COMMIT`).run();
  } catch (e) {
    db.prepare(`ROLLBACK`).run();
    throw e;
  }

  const newBalance = fromCents((db.prepare(`SELECT balance_cents FROM users WHERE id = ?`).get(userId) as any).balance_cents);
  const holding = db.prepare(`SELECT * FROM holdings WHERE user_id = ? AND fund_id = ?`).get(userId, fundId) as any;

  return { newBalance, holding };
}

export function createDivestment(userId: number, holdingId: number, amountDollars: number) {
  const amountCents = toCents(amountDollars);

  const holding = db.prepare(`SELECT * FROM holdings WHERE id = ? AND user_id = ?`).get(holdingId, userId) as any;
  if (!holding) throw new Error('Holding not found');
  if (holding.current_cents < amountCents) throw new Error('Insufficient holding value');

  const fund = db.prepare(`SELECT name FROM funds WHERE id = ?`).get(holding.fund_id) as { name: string };

  db.prepare(`BEGIN`).run();
  try {
    // Add balance
    db.prepare(`UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?`).run(amountCents, userId);

    // Update or delete holding
    const newCurrent = holding.current_cents - amountCents;
    const newInvested = Math.max(0, holding.invested_cents - (amountCents / holding.current_cents) * holding.invested_cents);

    if (newCurrent <= 1) {
      db.prepare(`DELETE FROM holdings WHERE id = ?`).run(holdingId);
    } else {
      db.prepare(`
        UPDATE holdings SET invested_cents = ?, current_cents = ?, updated_at = ? WHERE id = ?
      `).run(Math.round(newInvested), newCurrent, nowISO(), holdingId);
    }

    // Create transaction
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount_cents, status, description, fund_name)
      VALUES (?, 'divestment', ?, 'Completed', ?, ?)
    `).run(userId, amountCents, `Sale of ${fund.name}`, fund.name);

    db.prepare(`COMMIT`).run();
  } catch (e) {
    db.prepare(`ROLLBACK`).run();
    throw e;
  }

  const newBalance = fromCents((db.prepare(`SELECT balance_cents FROM users WHERE id = ?`).get(userId) as any).balance_cents);
  const updatedHolding = db.prepare(`SELECT * FROM holdings WHERE id = ?`).get(holdingId) as any | undefined;

  return { newBalance, holding: updatedHolding || null };
}

// Helper to format a transaction from DB row to API shape
export function formatTransaction(row: any) {
  return {
    id: String(row.id),
    date: row.created_at?.split('T')[0] || row.created_at,
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
