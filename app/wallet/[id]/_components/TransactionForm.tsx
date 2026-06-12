import { useRef } from 'react'
import { Button } from '@/components/ui/button'
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
        <input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Сумма"
          required
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          name="type"
          defaultValue="expense"
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
        </select>
      </div>

      <div className="flex gap-2">
        <input
          name="category"
          type="text"
          placeholder="Категория"
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="date"
          type="date"
          defaultValue={today}
          required
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
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
