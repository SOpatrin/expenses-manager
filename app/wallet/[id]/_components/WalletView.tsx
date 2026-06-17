'use client'

import type { Transaction } from '@/lib/transactions'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import WalletStats from './WalletStats'
import { useTransactions } from './useTransactions'

export default function WalletView({
  walletId,
  initialTransactions,
  rates,
}: {
  walletId: string
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
  } = useTransactions(walletId, initialTransactions)

  return (
    <div className="flex flex-col gap-6">
      <WalletStats transactions={optimisticTransactions} rates={rates} />
      <TransactionForm
        onSubmit={handleSubmit}
        addState={addState}
        isAdding={isAdding}
      />
      <TransactionList
        transactions={optimisticTransactions}
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
