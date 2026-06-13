import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requireUser } from '@/lib/auth'
import { getWalletInvites } from '@/lib/invites'
import { getWallet, getWalletMembers } from '@/lib/wallets'

import { removeWalletMemberAction } from '../actions'
import { InviteSection } from './_components/InviteSection'

export default async function WalletSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: userId, isGuest } = await requireUser()
  if (isGuest) notFound()
  const { id } = await params

  const wallet = await getWallet(userId, id)
  if (!wallet) notFound()

  const [members, invites] = await Promise.all([
    getWalletMembers(userId, id),
    getWalletInvites(userId, id),
  ])

  const currentMember = members.find((m) => m.userId === userId)
  const isOwner = currentMember?.role === 'owner'

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/wallet/${id}`}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          ←
        </Link>
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          Участники
        </h1>
      </div>

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
                  action={removeWalletMemberAction.bind(null, id, m.userId)}
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

      <InviteSection walletId={id} pendingInvites={invites} isOwner={isOwner} />
    </main>
  )
}
