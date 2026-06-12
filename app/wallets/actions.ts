'use server'

import { redirect } from 'next/navigation'

import { requireUserId } from '@/lib/auth'
import { createWallet } from '@/lib/wallets'

export async function createWalletAction(formData: FormData): Promise<void> {
  const userId = await requireUserId()
  const name = ((formData.get('name') as string | null) ?? '').trim()
  const wallet = await createWallet(userId, name || 'Новый кошелёк')
  redirect(`/wallet/${wallet.id}`)
}
