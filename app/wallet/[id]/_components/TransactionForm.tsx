'use client'

import { useLocalStorage } from '@/app/_hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import type { AddTransactionState } from '../actions'

const today = new Date().toISOString().split('T')[0]

export default function TransactionForm({
  onSubmit,
  addState,
  isAdding,
}: {
  onSubmit: (formData: FormData) => void
  addState: AddTransactionState
  isAdding: boolean
}) {
  const [currency, setCurrency] = useLocalStorage('tx-currency', 'RSD')
  const [type, setType] = useLocalStorage('tx-type', 'expense')

  function handleAction(formData: FormData) {
    onSubmit(formData)
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
        />
        <Input name="date" type="date" defaultValue={today} required />
      </div>

      {addState.status === 'error' && (
        <p className="text-xs text-red-500">{addState.message}</p>
      )}

      <Button type="submit" disabled={isAdding}>
        {isAdding ? 'Сохраняю...' : 'Добавить'}
      </Button>
    </form>
  )
}
