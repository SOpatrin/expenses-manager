'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUserId } from '@/lib/auth'
import { acceptInvite, createInvite, revokeInvite } from '@/lib/invites'

export async function createInviteAction(
  walletId: string,
  email?: string,
): Promise<string> {
  const userId = await requireUserId()
  return createInvite(userId, walletId, email)
}

export async function acceptInviteAction(token: string): Promise<void> {
  const userId = await requireUserId()
  const walletId = await acceptInvite(userId, token)
  redirect(`/wallet/${walletId}`)
}

export async function revokeInviteAction(
  walletId: string,
  token: string,
): Promise<void> {
  const userId = await requireUserId()
  await revokeInvite(userId, token)
  revalidatePath(`/wallet/${walletId}/settings`)
}
