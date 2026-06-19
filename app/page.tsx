import { redirect } from 'next/navigation'

import { requireUserId } from '@/app/_session'
import { createWallet, getWallets } from '@/lib/wallets'

export default async function Home() {
  const userId = await requireUserId()

  const wallets = await getWallets(userId)

  if (wallets.length === 0) {
    const wallet = await createWallet(userId, 'Мой кошелёк')
    redirect(`/wallet/${wallet.id}`)
  }

  if (wallets.length === 1) {
    redirect(`/wallet/${wallets[0].id}`)
  }

  redirect('/wallets')
}
