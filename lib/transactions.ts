import { and, desc, eq } from 'drizzle-orm'
import { db } from './db'
import { transactions, walletMembers } from './schema'

export type NewTransaction = {
  amount: number
  currency: string
  type: 'income' | 'expense'
  category?: string
  description?: string
  date: string // 'YYYY-MM-DD'
}

export type Transaction = typeof transactions.$inferSelect

async function assertWalletAccess(
  userId: string,
  walletId: string,
): Promise<void> {
  const [member] = await db
    .select()
    .from(walletMembers)
    .where(
      and(
        eq(walletMembers.walletId, walletId),
        eq(walletMembers.userId, userId),
      ),
    )
    .limit(1)

  if (!member) throw new Error('Access denied')
}

export async function createTransaction(
  userId: string,
  walletId: string,
  data: NewTransaction,
): Promise<Transaction> {
  await assertWalletAccess(userId, walletId)

  const [transaction] = await db
    .insert(transactions)
    .values({ ...data, walletId, createdBy: userId })
    .returning()

  return transaction
}

export async function getTransactions(
  userId: string,
  walletId: string,
): Promise<Transaction[]> {
  await assertWalletAccess(userId, walletId)

  return db
    .select()
    .from(transactions)
    .where(eq(transactions.walletId, walletId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
}

export async function updateTransaction(
  userId: string,
  walletId: string,
  transactionId: string,
  data: Partial<NewTransaction>,
): Promise<Transaction> {
  await assertWalletAccess(userId, walletId)

  const [transaction] = await db
    .update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.walletId, walletId),
      ),
    )
    .returning()

  if (!transaction) throw new Error('Transaction not found or access denied')

  return transaction
}

export async function deleteTransaction(
  userId: string,
  walletId: string,
  transactionId: string,
): Promise<void> {
  await assertWalletAccess(userId, walletId)

  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.walletId, walletId),
      ),
    )
}
