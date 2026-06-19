import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { requireUser } from '@/app/_session'
import { getWalletInvites } from '@/lib/invites'
import { getWallet, getWalletMembers, type WalletMember } from '@/lib/wallets'

import { removeWalletMemberAction } from '../actions'
import { InviteSection } from './_components/InviteSection'

const pulse = 'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800'

export default function WalletSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <BackLink params={params} />
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          Участники
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

function MembersList({
  walletId,
  members,
  isOwner,
}: {
  walletId: string
  members: WalletMember[]
  isOwner: boolean
}) {
  return (
    <ul className="mb-8 divide-y divide-zinc-100 dark:divide-zinc-800">
      {members.map((m) => (
        <li key={m.userId} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {m.name ?? m.email ?? m.userId}
            </p>
            {m.email && m.name && (
              <p className="text-xs text-zinc-400">{m.email}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">
              {m.role === 'owner' ? 'владелец' : 'участник'}
            </span>
            {isOwner && m.role !== 'owner' && (
              <form
                action={removeWalletMemberAction.bind(null, walletId, m.userId)}
              >
                <button
                  type="submit"
                  className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  Удалить
                </button>
              </form>
            )}
          </div>
        </li>
      ))}
    </ul>
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
