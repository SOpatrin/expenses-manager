'use client'

import { useState, useTransition } from 'react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { createInviteAction, revokeInviteAction } from '@/app/actions/invites'
import { Button } from '@/components/ui/button'
import { useT } from '@/app/_i18n/client'
import type { PendingInvite } from '@/lib/invites'

export function InviteSection({
  walletId,
  pendingInvites,
  isOwner,
}: {
  walletId: string
  pendingInvites: PendingInvite[]
  isOwner: boolean
}) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const t = useT()

  if (!isOwner) return null

  function handleCreate() {
    startTransition(async () => {
      const token = await createInviteAction(walletId)
      const url = `${window.location.origin}/invite/${token}`
      setInviteUrl(url)
      navigator.clipboard.writeText(url)
      toast.success(t.settings.linkCopied)
    })
  }

  function handleCopy() {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    toast.success(t.settings.linkCopied)
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {t.settings.inviteTitle}
      </h2>

      {inviteUrl ? (
        <button
          onClick={handleCopy}
          className="mb-4 flex w-full items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-left hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
        >
          <span className="flex-1 truncate font-mono text-xs text-zinc-600 dark:text-zinc-300">
            {inviteUrl}
          </span>
          <Copy className="size-3.5 shrink-0 text-zinc-400" />
        </button>
      ) : (
        <Button
          onClick={handleCreate}
          disabled={isPending}
          variant="outline"
          className="mb-4"
        >
          {isPending ? '...' : t.settings.createInviteLink}
        </Button>
      )}

      {pendingInvites.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-zinc-400">
            {t.settings.activeInvites}
          </p>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {pendingInvites.map((inv) => (
              <li
                key={inv.token}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="min-w-0 truncate font-mono text-xs text-zinc-500">
                  {inv.email ?? inv.token.slice(0, 8) + '…'}
                </span>
                <form
                  action={revokeInviteAction.bind(null, walletId, inv.token)}
                  className="shrink-0"
                >
                  <button
                    type="submit"
                    className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    {t.settings.revoke}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
