'use client'

import { useT } from '@/app/_i18n/client'
import type { WalletMember } from '@/lib/wallets'

import { removeWalletMemberAction } from '../../actions'

export function MembersList({
  walletId,
  members,
  isOwner,
}: {
  walletId: string
  members: WalletMember[]
  isOwner: boolean
}) {
  const t = useT()

  return (
    <ul className="mb-8 divide-y divide-zinc-100 dark:divide-zinc-800">
      {members.map((m) => (
        <li
          key={m.userId}
          className="flex items-center justify-between gap-3 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {m.name ?? m.email ?? m.userId}
            </p>
            {m.email && m.name && (
              <p className="truncate text-xs text-zinc-400">{m.email}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs text-zinc-400">
              {m.role === 'owner' ? t.settings.owner : t.settings.member}
            </span>
            {isOwner && m.role !== 'owner' && (
              <form
                action={removeWalletMemberAction.bind(null, walletId, m.userId)}
              >
                <button
                  type="submit"
                  className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  {t.settings.remove}
                </button>
              </form>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
