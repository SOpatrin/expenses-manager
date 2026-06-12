import { and, eq, isNull } from 'drizzle-orm'

import { db } from './db'
import { users, walletInvites, wallets } from './schema'
import { addWalletMember, getWallet } from './wallets'

export type InviteInfo = {
  token: string
  walletId: string
  walletName: string
  invitedByName: string | null
  email: string | null
  acceptedAt: Date | null
}

export type PendingInvite = {
  token: string
  email: string | null
  createdAt: Date
}

export async function createInvite(
  userId: string,
  walletId: string,
  email?: string,
): Promise<string> {
  const wallet = await getWallet(userId, walletId)
  if (!wallet) throw new Error('Access denied')

  const [invite] = await db
    .insert(walletInvites)
    .values({ walletId, invitedBy: userId, email: email ?? null })
    .returning()

  return invite.token
}

export async function getInvite(token: string): Promise<InviteInfo | null> {
  const [row] = await db
    .select({
      token: walletInvites.token,
      walletId: walletInvites.walletId,
      walletName: wallets.name,
      invitedByName: users.name,
      email: walletInvites.email,
      acceptedAt: walletInvites.acceptedAt,
    })
    .from(walletInvites)
    .innerJoin(wallets, eq(walletInvites.walletId, wallets.id))
    .innerJoin(users, eq(walletInvites.invitedBy, users.id))
    .where(eq(walletInvites.token, token))
    .limit(1)

  return row ?? null
}

export async function getWalletInvites(
  userId: string,
  walletId: string,
): Promise<PendingInvite[]> {
  const wallet = await getWallet(userId, walletId)
  if (!wallet) throw new Error('Access denied')

  return db
    .select({
      token: walletInvites.token,
      email: walletInvites.email,
      createdAt: walletInvites.createdAt,
    })
    .from(walletInvites)
    .where(
      and(
        eq(walletInvites.walletId, walletId),
        isNull(walletInvites.acceptedAt),
      ),
    )
}

export async function acceptInvite(
  userId: string,
  token: string,
): Promise<string> {
  const invite = await getInvite(token)
  if (!invite) throw new Error('Invite not found')
  if (invite.acceptedAt) throw new Error('Invite already accepted')

  await addWalletMember(invite.walletId, userId)
  await db
    .update(walletInvites)
    .set({ acceptedAt: new Date() })
    .where(eq(walletInvites.token, token))

  return invite.walletId
}

export async function revokeInvite(
  userId: string,
  token: string,
): Promise<void> {
  const invite = await getInvite(token)
  if (!invite) throw new Error('Invite not found')

  const wallet = await getWallet(userId, invite.walletId)
  if (!wallet) throw new Error('Access denied')

  await db.delete(walletInvites).where(eq(walletInvites.token, token))
}
