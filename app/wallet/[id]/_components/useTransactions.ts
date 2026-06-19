'use client'

import {
  startTransition,
  useActionState,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react'
import { DEV_USER_ID } from '@/app/_dev'
import type { Transaction } from '@/lib/transactions'
import {
  type AddTransactionState,
  addTransaction,
  deleteTransactionAction,
  updateTransactionAction,
} from '../actions'

type OptimisticAction =
  | { type: 'add'; formData: FormData }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; formData: FormData }

export function useTransactions(
  walletId: string,
  initialTransactions: Transaction[],
) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isUpdating, startUpdateTransition] = useTransition()

  const [optimisticTransactions, updateOptimistic] = useOptimistic(
    initialTransactions,
    (state: Transaction[], action: OptimisticAction) => {
      if (action.type === 'delete') {
        return state.filter((t) => t.id !== action.id)
      }
      if (action.type === 'update') {
        return state.map((t) =>
          t.id === action.id
            ? {
                ...t,
                amount: Number(
                  String(action.formData.get('amount') ?? '').replace(',', '.'),
                ),
                currency:
                  (action.formData.get('currency') as string) || t.currency,
                type: action.formData.get('type') as Transaction['type'],
                category: (action.formData.get('category') as string) || null,
                date: action.formData.get('date') as string,
              }
            : t,
        )
      }
      const optimistic: Transaction = {
        id: crypto.randomUUID(),
        walletId,
        createdBy: DEV_USER_ID,
        amount: Number(
          String(action.formData.get('amount') ?? '').replace(',', '.'),
        ),
        currency: (action.formData.get('currency') as string) || 'RSD',
        type: action.formData.get('type') as Transaction['type'],
        category: (action.formData.get('category') as string) || null,
        description: (action.formData.get('description') as string) || null,
        date: action.formData.get('date') as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return [optimistic, ...state]
    },
  )

  const [addState, submitAdd, isAdding] = useActionState<
    AddTransactionState,
    FormData | 'reset'
  >(
    async (prevState, payload) => {
      // 'reset' приходит из cleanup при скрытии страницы через <Activity>.
      if (payload === 'reset') return { status: 'idle' }
      return addTransaction(walletId, prevState, payload)
    },
    { status: 'idle' },
  )

  // <Activity> сохраняет инстанс формы между навигациями: без сброса прошлый
  // success/error из addState «залипает» и снова виден при возврате на страницу.
  // Помечаем, что был сабмит, и чистим состояние при скрытии компонента.
  const shouldResetAddState = useRef(false)
  useLayoutEffect(() => {
    return () => {
      if (shouldResetAddState.current) {
        shouldResetAddState.current = false
        startTransition(() => submitAdd('reset'))
      }
    }
  }, [submitAdd])

  function handleSubmit(formData: FormData) {
    shouldResetAddState.current = true
    startTransition(() => {
      updateOptimistic({ type: 'add', formData })
      submitAdd(formData)
    })
  }

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      updateOptimistic({ type: 'delete', id })
      await deleteTransactionAction(walletId, id)
    })
  }

  function handleUpdate(id: string, formData: FormData) {
    setEditingId(null)
    startUpdateTransition(async () => {
      updateOptimistic({ type: 'update', id, formData })
      await updateTransactionAction(walletId, id, formData)
    })
  }

  return {
    optimisticTransactions,
    addState,
    isAdding,
    isDeleting,
    isUpdating,
    editingId,
    handleSubmit,
    handleDelete,
    handleEdit: setEditingId,
    handleCancelEdit: () => setEditingId(null),
    handleUpdate,
  }
}
