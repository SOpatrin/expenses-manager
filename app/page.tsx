import { redirect } from 'next/navigation'

import { requireUserId } from '@/app/_session'
import { getT } from '@/app/_i18n/server'
import { createWallet, getWallets } from '@/lib/wallets'

export default async function Home() {
  const userId = await requireUserId()

  const wallets = await getWallets(userId)

  if (wallets.length === 0) {
    const { t } = await getT()
    const wallet = await createWallet(userId, t.wallets.defaultName)
    redirect(`/wallet/${wallet.id}`)
  }

  if (wallets.length === 1) {
    redirect(`/wallet/${wallets[0].id}`)
  }

  redirect('/wallets')
}
