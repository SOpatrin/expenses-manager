'use client'

import { useTransition } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useT } from '@/app/_i18n/client'

import { deleteWalletAction } from '../actions'

export function DeleteWalletButton({ walletId }: { walletId: string }) {
  const [isPending, startTransition] = useTransition()
  const t = useT()

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isPending}
        className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      >
        {isPending ? '...' : t.wallets.deleteButton}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.wallets.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.wallets.deleteDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={() => startTransition(() => deleteWalletAction(walletId))}
          >
            {t.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
