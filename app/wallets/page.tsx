import Link from 'next/link'
import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { CookiesProvider } from '@/app/_hooks/useCookieState'
import { LanguageToggle } from '@/app/_components/LanguageToggle'
import { ThemeToggle } from '@/app/_components/ThemeToggle'
import { getT } from '@/app/_i18n/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requireUserId } from '@/app/_session'
import { getWallets, type Wallet } from '@/lib/wallets'

import { signOutAction } from '../wallet/[id]/actions'
import { createWalletAction } from './actions'

const pulse = 'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800'

export default function WalletsPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <Suspense fallback={<PageSkeleton />}>
        <WalletsContent />
      </Suspense>
    </main>
  )
}

async function WalletsContent() {
  const { locale, t } = await getT()

  return (
    <CookiesProvider initial={{ locale }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          {t.wallets.title}
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {t.common.signOut}
            </button>
          </form>
        </div>
      </div>

      <Suspense fallback={<WalletListSkeleton />}>
        <CachedWalletList />
      </Suspense>

      <form action={createWalletAction} className="flex gap-2">
        <Input
          name="name"
          placeholder={t.wallets.namePlaceholder}
          className="flex-1"
        />
        <Button type="submit">{t.common.create}</Button>
      </form>
    </CookiesProvider>
  )
}

async function CachedWalletList() {
  const userId = await requireUserId()
  return <CachedWalletListItems userId={userId} />
}

async function CachedWalletListItems({ userId }: { userId: string }) {
  'use cache: remote'
  cacheTag(`user-wallets-${userId}`)
  cacheLife('days')

  const wallets = await getWallets(userId)
  return <WalletListItems wallets={wallets} />
}

function PageSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className={`${pulse} h-7 w-24`} />
        <div className="flex items-center gap-3">
          <div className={`${pulse} h-7 w-20`} />
          <div className={`${pulse} h-7 w-14`} />
        </div>
      </div>
      <WalletListSkeleton />
      <div className={`${pulse} h-10 w-full`} />
    </>
  )
}

function WalletListSkeleton() {
  return (
    <ul className="mb-8 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="flex items-center justify-between py-3">
          <div className={`${pulse} h-4 w-32`} />
          <div className={`${pulse} h-4 w-4`} />
        </li>
      ))}
    </ul>
  )
}

function WalletListItems({ wallets }: { wallets: Wallet[] }) {
  return (
    <ul className="mb-8 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      {wallets.map((w) => (
        <li key={w.id}>
          <Link
            href={`/wallet/${w.id}`}
            className="flex items-center justify-between py-3 text-zinc-800 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            <span className="font-medium">{w.name}</span>
            <span className="text-zinc-400">→</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
