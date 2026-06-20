'use client'

import { useMemo, useState } from 'react'
import type { CategoryKey } from '@/lib/categories'
import type { TxType } from '@/lib/currencies'
import { filterTransactions } from '@/lib/filters'
import { getPeriodRange, type Period } from '@/lib/periods'
import type { Transaction } from '@/lib/transactions'
import Analytics from './Analytics'
import FilterBar, { type CustomRange } from './FilterBar'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import WalletStats from './WalletStats'
import { useTransactions } from './useTransactions'

export default function WalletView({
  walletId,
  currentUserId,
  initialTransactions,
  rates,
}: {
  walletId: string
  currentUserId: string
  initialTransactions: Transaction[]
  rates: Record<string, number>
}) {
  const {
    optimisticTransactions,
    addState,
    isAdding,
    isDeleting,
    isUpdating,
    editingId,
    handleSubmit,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    handleUpdate,
  } = useTransactions(walletId, initialTransactions, currentUserId)

  const today = new Date().toISOString().split('T')[0]
  const [period, setPeriod] = useState<Period>('all')
  const [type, setType] = useState<TxType | ''>('')
  const [category, setCategory] = useState<CategoryKey | ''>('')
  const [custom, setCustom] = useState<CustomRange>({ from: today, to: today })
  const [tab, setTab] = useState<'list' | 'analytics'>('list')

  const filtered = useMemo(() => {
    const range =
      period === 'custom'
        ? { from: custom.from || undefined, to: custom.to || undefined }
        : getPeriodRange(period)
    return filterTransactions(optimisticTransactions, {
      type: type || undefined,
      category: category || undefined,
      ...range,
    })
  }, [optimisticTransactions, period, type, category, custom])

  const renderList = (txs: Transaction[]) => (
    <TransactionList
      transactions={txs}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      editingId={editingId}
      onEdit={handleEdit}
      onUpdate={handleUpdate}
      onCancelEdit={handleCancelEdit}
      isUpdating={isUpdating}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <WalletStats
        transactions={tab === 'analytics' ? filtered : optimisticTransactions}
        rates={rates}
      />

      <div className="flex gap-1.5">
        {(['list', 'analytics'] as const).map((t) => {
          const active = tab === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {t === 'list' ? 'Список' : 'Аналитика'}
            </button>
          )
        })}
      </div>

      {tab === 'list' ? (
        <>
          <TransactionForm
            walletId={walletId}
            onSubmit={handleSubmit}
            addState={addState}
            isAdding={isAdding}
          />
          {renderList(optimisticTransactions)}
        </>
      ) : (
        <>
          <FilterBar
            period={period}
            onPeriodChange={setPeriod}
            type={type}
            onTypeChange={setType}
            category={category}
            onCategoryChange={setCategory}
            custom={custom}
            onCustomChange={setCustom}
          />
          <Analytics
            transactions={filtered}
            rates={rates}
            type={type}
            activeCategory={category}
            onCategoryChange={setCategory}
          />
          {renderList(filtered)}
        </>
      )}
    </div>
  )
}
