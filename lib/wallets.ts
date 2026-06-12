import { and, eq } from 'drizzle-orm'

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

export async function getWallet(
  userId: string,
  walletId: string,
): Promise<Wallet | null> {
  const [row] = await db
    .select({ wallet: wallets })
    .from(walletMembers)
    .innerJoin(wallets, eq(walletMembers.walletId, wallets.id))
    .where(
      and(
        eq(walletMembers.userId, userId),
        eq(walletMembers.walletId, walletId),
      ),
    )
    .limit(1)

  return row?.wallet ?? null
}

export async function getWallets(userId: string): Promise<Wallet[]> {
  const rows = await db
    .select({ wallet: wallets })
    .from(walletMembers)
    .innerJoin(wallets, eq(walletMembers.walletId, wallets.id))
    .where(eq(walletMembers.userId, userId))
    .orderBy(wallets.createdAt)

  return rows.map((r) => r.wallet)
}

export async function renameWallet(
  userId: string,
  walletId: string,
  name: string,
): Promise<void> {
  const wallet = await getWallet(userId, walletId)
  if (!wallet) throw new Error('Wallet not found or access denied')

  await db.update(wallets).set({ name }).where(eq(wallets.id, walletId))
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
