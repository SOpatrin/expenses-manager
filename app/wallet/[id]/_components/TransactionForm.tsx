'use client'

import { useActionState, useOptimistic, useRef } from 'react'
import { DEV_USER_ID } from '@/app/_dev'
import { Button } from '@/components/ui/button'
import type { Transaction } from '@/lib/transactions'
import {
  type AddTransactionState,
  addTransaction,
} from '../actions'
import TransactionList from './TransactionList'

const today = new Date().toISOString().split('T')[0]

export default function TransactionForm({
  walletId,
  initialTransactions,
}: {
  walletId: string
  initialTransactions: Transaction[]
}) {
  const formRef = useRef<HTMLFormElement>(null)

  const [optimisticTransactions, addOptimistic] = useOptimistic(
    initialTransactions,
    (state: Transaction[], formData: FormData) => {
      const optimistic: Transaction = {
        id: crypto.randomUUID(),
        walletId,
        createdBy: DEV_USER_ID,
        amount: Number(formData.get('amount')),
        currency: 'RUB',
        type: formData.get('type') as Transaction['type'],
        category: (formData.get('category') as string) || null,
        description: (formData.get('description') as string) || null,
        date: formData.get('date') as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return [optimistic, ...state]
    },
  )

  const action = addTransaction.bind(null, walletId)
  const [state, dispatch, isPending] = useActionState<
    AddTransactionState,
    FormData
  >(action, { status: 'idle' })

  function handleSubmit(formData: FormData) {
    addOptimistic(formData)
    formRef.current?.reset()
    dispatch(formData)
  }

  return (
    <div className="flex flex-col gap-6">
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
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

        {state.status === 'error' && (
          <p className="text-xs text-red-500">{state.message}</p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Сохраняю...' : 'Добавить'}
        </Button>
      </form>

      <TransactionList transactions={optimisticTransactions} />
    </div>
  )
}
