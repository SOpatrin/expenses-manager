import { getTransactions } from '@/lib/transactions'
import { DEV_USER_ID } from '@/app/_dev'
import TransactionForm from './_components/TransactionForm'

export default async function WalletPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const transactions = await getTransactions(DEV_USER_ID, id)

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Кошелёк
      </h1>
      <TransactionForm walletId={id} initialTransactions={transactions} />
    </main>
  )
}
