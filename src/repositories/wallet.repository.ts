import { query, pool } from '../config/database';

export interface WalletRecord {
  id: number;
  user_id: string;
  balance: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionRecord {
  id: number;
  sender_id: string;
  receiver_id: string;
  amount: string;
  created_at: Date;
}

export async function findWalletByUserId(userId: string): Promise<WalletRecord | null> {
  const rows = await query(
    'SELECT id, user_id, balance, created_at, updated_at FROM wallets WHERE user_id = $1 LIMIT 1',
    [userId],
  ) as WalletRecord[];

  return rows.length > 0 ? rows[0] : null;
}

export async function insertTransaction(
  senderId: string,
  receiverId: string,
  amount: string,
): Promise<TransactionRecord> {
  const rows = await query(
    `INSERT INTO transactions (sender_id, receiver_id, amount)
     VALUES ($1, $2, $3)
     RETURNING id, sender_id, receiver_id, amount, created_at`,
    [senderId, receiverId, amount],
  ) as TransactionRecord[];

  return rows[0];
}

export async function updateBalance(userId: string, newBalance: string): Promise<void> {
  await query(
    'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE user_id = $2',
    [newBalance, userId],
  );
}

export async function transferAtomic(
  senderId: string,
  receiverId: string,
  amount: string,
  newSenderBalance: string,
  newReceiverBalance: string,
): Promise<TransactionRecord> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE user_id = $2',
      [newSenderBalance, senderId],
    );
    await client.query(
      'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE user_id = $2',
      [newReceiverBalance, receiverId],
    );
    const result = await client.query(
      `INSERT INTO transactions (sender_id, receiver_id, amount)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, receiver_id, amount, created_at`,
      [senderId, receiverId, amount],
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
