'use client'

import { useRef } from 'react'
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
  const formRef = useRef<HTMLFormElement>(null)

  function handleAction(formData: FormData) {
    onSubmit(formData)
    formRef.current?.reset()
  }

  return (
    <form ref={formRef} action={handleAction} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Сумма"
          required
          className="w-full"
        />
        <NativeSelect name="type" defaultValue="expense">
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
