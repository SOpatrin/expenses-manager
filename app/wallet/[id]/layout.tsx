import { requireUserId } from '@/lib/auth'
import { getWallets } from '@/lib/wallets'

import { WalletSidebar } from './_components/WalletSidebar'
import { WalletSwipeNavigator } from './_components/WalletSwipeNavigator'

export default async function WalletLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const userId = await requireUserId()
  const { id } = await params
  const wallets = await getWallets(userId)

  return (
    <div className="flex justify-center">
      <WalletSidebar wallets={wallets} activeId={id} />
      <WalletSwipeNavigator wallets={wallets} currentId={id}>
        {children}
      </WalletSwipeNavigator>
      <div className="hidden w-44 shrink-0 lg:block" aria-hidden="true" />
    </div>
  )
}
