'use client'

import { useTransition } from 'react'

import { deleteWalletAction } from '../actions'

export function DeleteWalletButton({ walletId }: { walletId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Удалить кошелёк? Все транзакции будут удалены безвозвратно.'))
      return
    startTransition(() => deleteWalletAction(walletId))
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
    >
      {isPending ? '...' : 'Удалить кошелек'}
    </button>
  )
}
