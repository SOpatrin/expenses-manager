import { Trash2 } from 'lucide-react'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { getCategory } from '@/lib/categories'
import type { Transaction } from '@/lib/transactions'
import { InlineEditForm } from './InlineEditForm'

function formatAmount(
  amount: number,
  type: Transaction['type'],
  currency: string,
) {
  const sign = type === 'income' ? '+' : '−'
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${sign} ${formatted}`
}

export default function TransactionList({
  transactions,
  onDelete,
  isDeleting,
  editingId,
  onEdit,
  onUpdate,
  onCancelEdit,
  isUpdating,
}: {
  transactions: Transaction[]
  onDelete: (id: string) => void
  isDeleting: boolean
  editingId: string | null
  onEdit: (id: string) => void
  onUpdate: (id: string, formData: FormData) => void
  onCancelEdit: () => void
  isUpdating: boolean
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
          {editingId === t.id ? (
            <InlineEditForm
              t={t}
              onSave={(fd) => onUpdate(t.id, fd)}
              onCancel={onCancelEdit}
              disabled={isUpdating}
            />
          ) : (
            <SwipeableRow
              onDelete={() => onDelete(t.id)}
              disabled={isDeleting || isUpdating}
            >
              <div
                className="flex cursor-pointer items-center justify-between py-3"
                onClick={() => onEdit(t.id)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {t.description ||
                      getCategory(t.category ?? '')?.label ||
                      'Без категории'}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {(() => {
                      const cat = getCategory(t.category ?? '')
                      return cat ? `${cat.icon} ${cat.label} · ` : ''
                    })()}
                    {t.date}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={
                      t.type === 'income'
                        ? 'text-sm font-semibold text-emerald-600'
                        : 'text-sm font-semibold text-red-500'
                    }
                  >
                    {formatAmount(t.amount, t.type, t.currency)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(t.id)
                    }}
                    disabled={isDeleting || isUpdating}
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-400 disabled:pointer-events-none dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                    aria-label="Удалить"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </SwipeableRow>
          )}
        </li>
      ))}
    </ul>
  )
}
