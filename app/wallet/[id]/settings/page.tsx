import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { requireUser } from '@/app/_session'
import { getT } from '@/app/_i18n/server'
import { getWalletInvites } from '@/lib/invites'
import { getWallet, getWalletMembers } from '@/lib/wallets'

import { MembersList } from './_components/MembersList'
import { InviteSection } from './_components/InviteSection'

const pulse = 'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800'

export default async function WalletSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { t } = await getT()

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <BackLink params={params} />
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          {t.settings.title}
        </h1>
      </div>
      <Suspense fallback={<MembersSkeleton />}>
        <MembersContent params={params} />
      </Suspense>
    </main>
  )
}

async function BackLink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Link
      href={`/wallet/${id}`}
      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
    >
      ←
    </Link>
  )
}

async function MembersContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId, isGuest } = await requireUser()
  if (isGuest) notFound()
  const { id } = await params

  const wallet = await getWallet(userId, id)
  if (!wallet) notFound()

  return <CachedMembersContent userId={userId} walletId={id} />
}

async function CachedMembersContent({
  userId,
  walletId,
}: {
  userId: string
  walletId: string
}) {
  'use cache: remote'
  cacheTag(`wallet-members-${walletId}`)
  cacheLife('days')

  const [members, invites] = await Promise.all([
    getWalletMembers(userId, walletId),
    getWalletInvites(userId, walletId),
  ])

  const currentMember = members.find((m) => m.userId === userId)
  const isOwner = currentMember?.role === 'owner'

  return (
    <>
      <MembersList walletId={walletId} members={members} isOwner={isOwner} />
      <InviteSection
        walletId={walletId}
        pendingInvites={invites}
        isOwner={isOwner}
      />
    </>
  )
}

function MembersSkeleton() {
  return (
    <ul className="mb-8 divide-y divide-zinc-100 dark:divide-zinc-800">
      {[...Array(2)].map((_, i) => (
        <li key={i} className="flex items-center justify-between py-3">
          <div className="flex flex-col gap-1.5">
            <div className={`${pulse} h-4 w-32`} />
            <div className={`${pulse} h-3 w-40`} />
          </div>
          <div className={`${pulse} h-3 w-16`} />
        </li>
      ))}
    </ul>
  )
}
