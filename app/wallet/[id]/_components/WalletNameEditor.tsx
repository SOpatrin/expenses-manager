'use client'

import { useTransition } from 'react'
import { renameWalletAction } from '../actions'

export function WalletNameEditor({
  walletId,
  initialName,
}: {
  walletId: string
  initialName: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    save(e.target.value, e.target)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      save(e.currentTarget.value, e.currentTarget)
    }
    if (e.key === 'Escape') {
      e.currentTarget.value = initialName
      e.currentTarget.blur()
    }
  }

  function save(value: string, input: HTMLInputElement) {
    const trimmed = value.trim()
    if (!trimmed || trimmed === initialName) {
      input.value = initialName
      return
    }
    startTransition(async () => {
      await renameWalletAction(walletId, trimmed)
    })
  }

  return (
    <input
      key={initialName}
      defaultValue={initialName}
      disabled={isPending}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="min-w-0 flex-1 truncate bg-transparent text-xl font-semibold text-zinc-800 focus:border-b focus:border-zinc-400 focus:outline-none disabled:opacity-50 dark:text-zinc-100 dark:focus:border-zinc-500"
    />
  )
}
