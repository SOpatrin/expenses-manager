import { and, eq, sql } from 'drizzle-orm'
import { db } from './db'
import { transactions, walletMembers } from './schema'

export type WalletStats = {
  income: number
  expense: number
  balance: number
}

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

export async function getStats(
  userId: string,
  walletId: string,
): Promise<WalletStats> {
  await assertWalletAccess(userId, walletId)

  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(
        transactions.amount,
      ),
    })
    .from(transactions)
    .where(eq(transactions.walletId, walletId))
    .groupBy(transactions.type)

  const income = rows.find((r) => r.type === 'income')?.total ?? 0
  const expense = rows.find((r) => r.type === 'expense')?.total ?? 0

  return { income, expense, balance: income - expense }
}
