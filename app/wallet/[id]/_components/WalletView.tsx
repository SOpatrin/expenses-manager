'use client'

import { useMemo, useState } from 'react'
import type { CategoryKey } from '@/lib/categories'
import type { TxType } from '@/lib/currencies'
import { filterTransactions } from '@/lib/filters'
import { getPeriodRange, type Period } from '@/lib/periods'
import type { Transaction } from '@/lib/transactions'
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

  const [period, setPeriod] = useState<Period>('all')
  const [type, setType] = useState<TxType | ''>('')
  const [category, setCategory] = useState<CategoryKey | ''>('')
  const [custom, setCustom] = useState<CustomRange>({ from: '', to: '' })

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

  return (
    <div className="flex flex-col gap-6">
      <WalletStats transactions={filtered} rates={rates} />
      <TransactionForm
        walletId={walletId}
        onSubmit={handleSubmit}
        addState={addState}
        isAdding={isAdding}
      />
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
      <TransactionList
        transactions={filtered}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        editingId={editingId}
        onEdit={handleEdit}
        onUpdate={handleUpdate}
        onCancelEdit={handleCancelEdit}
        isUpdating={isUpdating}
      />
    </div>
  )
}
