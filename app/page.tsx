import { redirect } from 'next/navigation'

import { requireUserId } from '@/lib/auth'
import { createWallet, getFirstWallet } from '@/lib/wallets'

export default async function Home() {
  const userId = await requireUserId()

  const wallet =
    (await getFirstWallet(userId)) ??
    (await createWallet(userId, 'Мой кошелёк'))

  redirect(`/wallet/${wallet.id}`)
}
