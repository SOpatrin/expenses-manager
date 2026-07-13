'use client'

import { Trash2 } from 'lucide-react'
import { useLocale, useT } from '@/app/_i18n/client'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import type { Locale } from '@/lib/i18n'
import { getCategory, getCategoryLabel } from '@/lib/categories'
import { formatMoney } from '@/lib/format'
import type { Transaction } from '@/lib/transactions'
import { InlineEditForm } from './InlineEditForm'

function formatAmount(
  amount: number,
  type: Transaction['type'],
  currency: string,
  locale: Locale,
) {
  const sign = type === 'income' ? '+' : '−'
  const formatted = formatMoney(amount, currency, locale)
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
  const t = useT()
  const { locale } = useLocale()

  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400">{t.list.empty}</p>
    )
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {transactions.map((tx) => (
        <li key={tx.id}>
          {editingId === tx.id ? (
            <InlineEditForm
              t={tx}
              onSave={(fd) => onUpdate(tx.id, fd)}
              onCancel={onCancelEdit}
              disabled={isUpdating}
            />
          ) : (
            <SwipeableRow
              onDelete={() => onDelete(tx.id)}
              disabled={isDeleting || isUpdating}
            >
              <div
                className="flex cursor-pointer items-center justify-between gap-3 py-3"
                onClick={() => onEdit(tx.id)}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {tx.description ||
                      getCategoryLabel(tx.category ?? '', locale) ||
                      t.list.noCategory}
                  </span>
                  <span className="truncate text-xs text-zinc-400">
                    {(() => {
                      const cat = getCategory(tx.category ?? '')
                      return cat ? `${cat.icon} ${cat.label[locale]} · ` : ''
                    })()}
                    <span className="whitespace-nowrap">{tx.date}</span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span
                    className={
                      tx.type === 'income'
                        ? 'text-sm font-semibold whitespace-nowrap text-emerald-600'
                        : 'text-sm font-semibold whitespace-nowrap text-red-500'
                    }
                  >
                    {formatAmount(tx.amount, tx.type, tx.currency, locale)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(tx.id)
                    }}
                    disabled={isDeleting || isUpdating}
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-400 disabled:pointer-events-none dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                    aria-label={t.common.delete}
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
