import { requireUserId } from '@/lib/auth'
import { getTransactions } from '@/lib/transactions'

import { signOutAction } from './actions'
import WalletView from './_components/WalletView'

export default async function WalletPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const userId = await requireUserId()

  const { id } = await params
  const transactions = await getTransactions(userId, id)

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          Кошелёк
        </h1>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Выйти
          </button>
        </form>
      </div>
      <WalletView walletId={id} initialTransactions={transactions} />
    </main>
  )
}
