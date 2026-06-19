import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { CookiesProvider } from '@/app/_hooks/useCookieState'
import { requireUser } from '@/app/_session'
import { getRates } from '@/lib/rates'
import { getTransactions } from '@/lib/transactions'
import { getWallet } from '@/lib/wallets'

import { signOutAction } from './actions'
import { WalletNameEditor } from './_components/WalletNameEditor'
import WalletView from './_components/WalletView'
import { DeleteWalletButton } from '../../wallets/_components/DeleteWalletButton'

const pulse = 'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800'

export default function WalletPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Suspense fallback={<HeaderSkeleton />}>
        <WalletHeader params={params} />
      </Suspense>
      <Suspense fallback={<TransactionsSkeleton />}>
        <WalletBody params={params} />
      </Suspense>
      <div className="mt-16 flex justify-center">
        <Suspense fallback={null}>
          <DeleteSlot params={params} />
        </Suspense>
      </div>
    </main>
  )
}

async function WalletHeader({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId, isGuest } = await requireUser()
  const { id } = await params
  const wallet = await getCachedWalletMeta(userId, id)
  if (!wallet) notFound()

  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <Link
        href="/wallets"
        className="shrink-0 text-zinc-400 hover:text-zinc-600 lg:hidden dark:hover:text-zinc-200"
        aria-label="Все кошельки"
      >
        ←
      </Link>
      <WalletNameEditor walletId={id} initialName={wallet.name} />
      <div className="flex items-center gap-3">
        {!isGuest && (
          <Link
            href={`/wallet/${id}/settings`}
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Участники
          </Link>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Выйти
          </button>
        </form>
      </div>
    </div>
  )
}

async function WalletBody({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await requireUser()
  const { id } = await params
  const [transactions, rates, cookieStore] = await Promise.all([
    getCachedTransactions(userId, id),
    getCachedRates(),
    cookies(),
  ])

  return (
    <CookiesProvider
      initial={{
        'display-currency': cookieStore.get('display-currency')?.value ?? '',
        'tx-currency': cookieStore.get('tx-currency')?.value ?? 'RSD',
        'tx-type': cookieStore.get('tx-type')?.value ?? 'expense',
      }}
    >
      <WalletView
        walletId={id}
        currentUserId={userId}
        initialTransactions={transactions}
        rates={rates}
      />
    </CookiesProvider>
  )
}

async function DeleteSlot({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DeleteWalletButton walletId={id} />
}

// --- Кэшируемые обёртки (lib/ остаётся чистым) ---

async function getCachedWalletMeta(userId: string, walletId: string) {
  'use cache: remote'
  cacheTag(`wallet-meta-${walletId}`)
  cacheLife('days')
  return getWallet(userId, walletId)
}

async function getCachedTransactions(userId: string, walletId: string) {
  'use cache: remote'
  cacheTag(`wallet-${walletId}`)
  cacheLife('days')
  return getTransactions(userId, walletId)
}

async function getCachedRates() {
  'use cache: remote'
  cacheTag('rates')
  cacheLife('hours')
  return getRates('USD').catch((): Record<string, number> => ({}))
}

// --- Скелетоны (локальные fallback'и вместо route-level loading.tsx) ---

function HeaderSkeleton() {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className={`${pulse} h-7 w-32`} />
      <div className={`${pulse} h-4 w-12`} />
    </div>
  )
}

function TransactionsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <div className={`${pulse} mb-2 h-3 w-12`} />
        <div className={`${pulse} h-8 w-32`} />
        <div className="mt-3 flex gap-4">
          <div className={`${pulse} h-4 w-20`} />
          <div className={`${pulse} h-4 w-20`} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className={`${pulse} h-10 flex-1`} />
          <div className={`${pulse} h-10 w-28`} />
        </div>
        <div className="flex gap-2">
          <div className={`${pulse} h-10 flex-1`} />
          <div className={`${pulse} h-10 w-36`} />
        </div>
        <div className={`${pulse} h-9 w-full`} />
      </div>
      <div className="mt-6 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1.5">
              <div className={`${pulse} h-4 w-24`} />
              <div className={`${pulse} h-3 w-16`} />
            </div>
            <div className={`${pulse} h-4 w-16`} />
          </div>
        ))}
      </div>
    </div>
  )
}
