import { eq } from 'drizzle-orm'

import { db } from './db'
import { walletMembers, wallets } from './schema'

export type Wallet = typeof wallets.$inferSelect

export async function getFirstWallet(userId: string): Promise<Wallet | null> {
  const [row] = await db
    .select({ wallet: wallets })
    .from(walletMembers)
    .innerJoin(wallets, eq(walletMembers.walletId, wallets.id))
    .where(eq(walletMembers.userId, userId))
    .limit(1)

  return row?.wallet ?? null
}

export async function createWallet(
  userId: string,
  name: string,
): Promise<Wallet> {
  const [wallet] = await db.insert(wallets).values({ name }).returning()
  await db
    .insert(walletMembers)
    .values({ walletId: wallet.id, userId, role: 'owner' })
  return wallet
}
