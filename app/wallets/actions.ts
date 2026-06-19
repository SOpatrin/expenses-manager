'use server'

import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'

import { requireUserId } from '@/app/_session'
import { createWallet, deleteWallet } from '@/lib/wallets'

export async function createWalletAction(formData: FormData): Promise<void> {
  const userId = await requireUserId()
  const name = ((formData.get('name') as string | null) ?? '').trim()
  const wallet = await createWallet(userId, name || 'Новый кошелёк')
  updateTag(`user-wallets-${userId}`)
  redirect(`/wallet/${wallet.id}`)
}

export async function deleteWalletAction(walletId: string): Promise<void> {
  const userId = await requireUserId()
  await deleteWallet(userId, walletId)
  updateTag(`user-wallets-${userId}`)
  redirect('/wallets')
}
