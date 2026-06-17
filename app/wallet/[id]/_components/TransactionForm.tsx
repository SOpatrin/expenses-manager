'use client'

import { useState } from 'react'
import { useLocalStorage } from '@/app/_hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import type { ReceiptDraft } from '@/lib/receipts'
import type { AddTransactionState } from '../actions'
import ReceiptScanButton from './ReceiptScanButton'

const today = new Date().toISOString().split('T')[0]

export default function TransactionForm({
  walletId,
  onSubmit,
  addState,
  isAdding,
}: {
  walletId: string
  onSubmit: (formData: FormData) => void
  addState: AddTransactionState
  isAdding: boolean
}) {
  const [currency, setCurrency] = useLocalStorage('tx-currency', 'RSD')
  const [type, setType] = useLocalStorage('tx-type', 'expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(today)

  function handleScanSuccess(draft: ReceiptDraft) {
    setAmount(String(draft.amount))
    setCategory(draft.category)
    setDate(draft.date)
    setCurrency(draft.currency)
    setType(draft.type)
  }

  function handleAction(formData: FormData) {
    onSubmit(formData)
    setAmount('')
    setCategory('')
    setDate(today)
  }

  return (
    <form action={handleAction} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          name="amount"
          type="text"
          inputMode="decimal"
          placeholder="Сумма"
          required
          className="w-full"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <NativeSelect
          key={currency}
          name="currency"
          defaultValue={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="RSD">RSD</option>
          <option value="RUB">RUB</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </NativeSelect>
        <NativeSelect
          key={type}
          name="type"
          defaultValue={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
        </NativeSelect>
      </div>

      <div className="flex gap-2">
        <Input
          name="category"
          type="text"
          placeholder="Категория"
          className="w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Input
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {addState.status === 'error' && (
        <p className="text-xs text-red-500">{addState.message}</p>
      )}

      <div className="flex gap-2">
        <ReceiptScanButton
          walletId={walletId}
          onScanSuccess={handleScanSuccess}
          disabled={isAdding}
        />
        <Button type="submit" disabled={isAdding} className="flex-1">
          {isAdding ? 'Сохраняю...' : 'Добавить'}
        </Button>
      </div>
    </form>
  )
}
