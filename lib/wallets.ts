import { and, eq } from 'drizzle-orm'

import { db } from './db'
import { transactions, users, walletMembers, wallets } from './schema'

export type WalletMember = {
  userId: string
  role: 'owner' | 'member'
  name: string | null
  email: string | null
}

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

export async function deleteWallet(
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

  if (!member || member.role !== 'owner')
    throw new Error('Only owner can delete wallet')

  await db.delete(transactions).where(eq(transactions.walletId, walletId))
  await db.delete(walletMembers).where(eq(walletMembers.walletId, walletId))
  await db.delete(wallets).where(eq(wallets.id, walletId))
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

export async function getWalletMembers(
  userId: string,
  walletId: string,
): Promise<WalletMember[]> {
  const access = await getWallet(userId, walletId)
  if (!access) throw new Error('Access denied')

  return db
    .select({
      userId: walletMembers.userId,
      role: walletMembers.role,
      name: users.name,
      email: users.email,
    })
    .from(walletMembers)
    .innerJoin(users, eq(walletMembers.userId, users.id))
    .where(eq(walletMembers.walletId, walletId))
}

export async function addWalletMember(
  walletId: string,
  userId: string,
): Promise<void> {
  await db
    .insert(walletMembers)
    .values({ walletId, userId, role: 'member' })
    .onConflictDoNothing()
}

export async function removeWalletMember(
  ownerUserId: string,
  walletId: string,
  targetUserId: string,
): Promise<void> {
  const [member] = await db
    .select()
    .from(walletMembers)
    .where(
      and(
        eq(walletMembers.walletId, walletId),
        eq(walletMembers.userId, ownerUserId),
      ),
    )

  if (!member || member.role !== 'owner')
    throw new Error('Only owner can remove members')

  if (targetUserId === ownerUserId)
    throw new Error('Owner cannot remove themselves')

  await db
    .delete(walletMembers)
    .where(
      and(
        eq(walletMembers.walletId, walletId),
        eq(walletMembers.userId, targetUserId),
      ),
    )
}
