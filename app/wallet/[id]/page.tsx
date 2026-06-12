import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requireUserId } from '@/lib/auth'
import { getTransactions } from '@/lib/transactions'
import { getWallet } from '@/lib/wallets'

import { signOutAction } from './actions'
import { WalletNameEditor } from './_components/WalletNameEditor'
import WalletView from './_components/WalletView'
import { DeleteWalletButton } from '../../wallets/_components/DeleteWalletButton'

export default async function WalletPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const userId = await requireUserId()

  const { id } = await params
  const [wallet, transactions] = await Promise.all([
    getWallet(userId, id),
    getTransactions(userId, id),
  ])

  if (!wallet) notFound()

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
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
          <Link
            href={`/wallet/${id}/settings`}
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Участники
          </Link>
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
      <WalletView walletId={id} initialTransactions={transactions} />
      <div className="mt-16 flex justify-center">
        <DeleteWalletButton walletId={id} />
      </div>
    </main>
  )
}
