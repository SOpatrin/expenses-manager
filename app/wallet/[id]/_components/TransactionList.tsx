import { Trash2 } from 'lucide-react'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import type { Transaction } from '@/lib/transactions'

function formatAmount(amount: number, type: Transaction['type']) {
  const sign = type === 'income' ? '+' : '−'
  return `${sign} ${amount.toLocaleString('ru-RU')} ₽`
}

export default function TransactionList({
  transactions,
  onDelete,
  isDeleting,
}: {
  transactions: Transaction[]
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400">
        Транзакций пока нет
      </p>
    )
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {transactions.map((t) => (
        <li key={t.id}>
          <SwipeableRow onDelete={() => onDelete(t.id)} disabled={isDeleting}>
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {t.category ?? 'Без категории'}
                </span>
                <span className="text-xs text-zinc-400">{t.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={
                    t.type === 'income'
                      ? 'text-sm font-semibold text-emerald-600'
                      : 'text-sm font-semibold text-red-500'
                  }
                >
                  {formatAmount(t.amount, t.type)}
                </span>
                <button
                  onClick={() => onDelete(t.id)}
                  disabled={isDeleting}
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-400 disabled:pointer-events-none dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                  aria-label="Удалить"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </SwipeableRow>
        </li>
      ))}
    </ul>
  )
}
