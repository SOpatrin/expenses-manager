import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { requireUserId } from '@/lib/auth'
import { getWallets } from '@/lib/wallets'

import { WalletSidebar } from './_components/WalletSidebar'

const pulse = 'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800'

export default function WalletLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  return (
    <div className="flex justify-center">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar params={params} />
      </Suspense>
      <div className="w-full max-w-lg">{children}</div>
      <div className="hidden w-44 shrink-0 lg:block" aria-hidden="true" />
    </div>
  )
}

async function Sidebar({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  const { id } = await params
  return <CachedSidebarWallets userId={userId} activeId={id} />
}

async function CachedSidebarWallets({
  userId,
  activeId,
}: {
  userId: string
  activeId: string
}) {
  'use cache: remote'
  cacheTag(`user-wallets-${userId}`)
  cacheLife('days')

  const wallets = await getWallets(userId)
  return <WalletSidebar wallets={wallets} activeId={activeId} />
}

function SidebarSkeleton() {
  return (
    <aside className="hidden w-44 shrink-0 flex-col px-2 py-8 lg:flex">
      <div className={`${pulse} mb-3 ml-2 h-3 w-16`} />
      <div className="mb-3 flex flex-col gap-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${pulse} h-9 w-full`} />
        ))}
      </div>
    </aside>
  )
}
