'use client'

import { useState } from 'react'
import { useCookieState } from '@/app/_hooks/useCookieState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { CATEGORIES, suggestCategory } from '@/lib/categories'
import { CURRENCIES, TX_TYPES, TX_TYPE_LABELS } from '@/lib/currencies'
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
  const [currency, setCurrency] = useCookieState('tx-currency')
  const [type, setType] = useCookieState('tx-type')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)

  function handleScanSuccess(draft: ReceiptDraft) {
    setAmount(String(draft.amount))
    setCategory(suggestCategory(draft.category))
    setDescription(draft.category)
    setDate(draft.date)
    setCurrency(draft.currency)
    setType(draft.type)
  }

  function handleAction(formData: FormData) {
    onSubmit(formData)
    setAmount('')
    setCategory('')
    setDescription('')
    setDate(today)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleAction(new FormData(e.currentTarget))
      }}
      className="flex flex-col gap-3"
    >
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
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TX_TYPES.map((t) => (
            <option key={t} value={t}>
              {TX_TYPE_LABELS[t]}
            </option>
          ))}
        </NativeSelect>
      </div>

      <Input
        name="description"
        type="text"
        placeholder="Заметка"
        className="w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex gap-2">
        <NativeSelect
          name="category"
          className="w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Категория: авто</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.label}
            </option>
          ))}
        </NativeSelect>
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
