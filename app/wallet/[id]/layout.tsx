import { requireUserId } from '@/lib/auth'
import { getWallets } from '@/lib/wallets'

import { WalletSidebar } from './_components/WalletSidebar'

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
      <div className="w-full max-w-lg">{children}</div>
      <div className="hidden w-44 shrink-0 lg:block" aria-hidden="true" />
    </div>
  )
}
