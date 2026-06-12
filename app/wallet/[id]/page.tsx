import { DEV_USER_ID } from '@/app/_dev'
import { getStats } from '@/lib/stats'
import { getTransactions } from '@/lib/transactions'
import TransactionForm from './_components/TransactionForm'
import WalletStats from './_components/WalletStats'

export default async function WalletPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [transactions, stats] = await Promise.all([
    getTransactions(DEV_USER_ID, id),
    getStats(DEV_USER_ID, id),
  ])

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Кошелёк
      </h1>
      <div className="flex flex-col gap-6">
        <WalletStats stats={stats} />
        <TransactionForm walletId={id} initialTransactions={transactions} />
      </div>
    </main>
  )
}
