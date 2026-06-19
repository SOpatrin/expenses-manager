'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUserId } from '@/app/_session'
import { acceptInvite, createInvite, revokeInvite } from '@/lib/invites'

export async function createInviteAction(
  walletId: string,
  email?: string,
): Promise<string> {
  const userId = await requireUserId()
  const token = await createInvite(userId, walletId, email)
  updateTag(`wallet-members-${walletId}`)
  return token
}

export async function acceptInviteAction(token: string): Promise<void> {
  const userId = await requireUserId()
  const walletId = await acceptInvite(userId, token)
  updateTag(`wallet-members-${walletId}`)
  updateTag(`user-wallets-${userId}`)
  redirect(`/wallet/${walletId}`)
}

export async function revokeInviteAction(
  walletId: string,
  token: string,
): Promise<void> {
  const userId = await requireUserId()
  await revokeInvite(userId, token)
  updateTag(`wallet-members-${walletId}`)
}
