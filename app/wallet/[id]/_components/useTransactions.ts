'use client'

import {
  startTransition,
  useActionState,
  useEffect,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react'
import { toast } from 'sonner'
import type { Transaction } from '@/lib/transactions'
import {
  type AddTransactionState,
  addTransaction,
  deleteTransactionAction,
  updateTransactionAction,
} from '../actions'

// Окно отмены удаления (мс): строка скрыта локально, реальный delete уходит после.
const UNDO_DELETE_MS = 5000

type OptimisticAction =
  | { type: 'add'; formData: FormData }
  | { type: 'update'; id: string; formData: FormData }

export function useTransactions(
  walletId: string,
  initialTransactions: Transaction[],
  currentUserId: string,
) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isUpdating, startUpdateTransition] = useTransition()

  // Удаления в окне отмены: id скрыты из списка, но ещё не ушли на сервер.
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(
    new Set(),
  )
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const [optimisticTransactions, updateOptimistic] = useOptimistic(
    initialTransactions,
    (state: Transaction[], action: OptimisticAction) => {
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
        createdBy: currentUserId,
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
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 9000),
        )
        return await Promise.race([
          addTransaction(walletId, prevState, payload),
          timeout,
        ])
      } catch {
        return {
          status: 'error',
          message: 'Не удалось сохранить. Попробуй ещё раз.',
        }
      }
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

  // При реальном уходе с роута (не <Activity>-скрытии) добиваем удаления,
  // по которым окно отмены ещё не истекло, чтобы они не потерялись.
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const [id, timer] of timers) {
        clearTimeout(timer)
        // Компонент уходит — тостить ошибку некому, молча проглатываем.
        void deleteTransactionAction(walletId, id).catch(() => {})
      }
      timers.clear()
    }
  }, [walletId])

  function handleSubmit(formData: FormData) {
    shouldResetAddState.current = true
    startTransition(() => {
      updateOptimistic({ type: 'add', formData })
      submitAdd(formData)
    })
  }

  function commitDelete(id: string) {
    // Гонка: таймер мог сработать в тот же тик, что и нажатие «Отменить».
    // clearTimeout для уже сработавшего таймера — no-op, поэтому cancelDelete
    // убирает id из map, а здесь проверяем: нет id — удаление отменено, выходим.
    if (!timersRef.current.has(id)) return
    timersRef.current.delete(id)
    startDeleteTransition(async () => {
      try {
        await deleteTransactionAction(walletId, id)
      } catch {
        toast.error('Не удалось удалить. Попробуй ещё раз.')
      } finally {
        // Успех: сервер уже отдал список без строки. Ошибка: строка вернётся.
        setPendingDeleteIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    })
  }

  function cancelDelete(id: string) {
    const timer = timersRef.current.get(id)
    if (timer) clearTimeout(timer)
    timersRef.current.delete(id)
    setPendingDeleteIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function handleDelete(id: string) {
    // Строка исчезает мгновенно, реальный delete — после окна отмены.
    const label =
      optimisticTransactions.find((t) => t.id === id)?.category ??
      'Без категории'
    setPendingDeleteIds((prev) => new Set(prev).add(id))
    const timer = setTimeout(() => commitDelete(id), UNDO_DELETE_MS)
    timersRef.current.set(id, timer)
    toast(`Удалили «${label}»`, {
      duration: UNDO_DELETE_MS,
      action: { label: 'Отменить', onClick: () => cancelDelete(id) },
    })
  }

  function handleUpdate(id: string, formData: FormData) {
    setEditingId(null)
    startUpdateTransition(async () => {
      updateOptimistic({ type: 'update', id, formData })
      try {
        await updateTransactionAction(walletId, id, formData)
      } catch {
        // useOptimistic откатит состояние сам — показываем уведомление
        toast.error('Не удалось сохранить изменения. Попробуй ещё раз.')
      }
    })
  }

  // Скрываем строки, по которым идёт окно отмены / запрос на удаление.
  const visibleTransactions = optimisticTransactions.filter(
    (t) => !pendingDeleteIds.has(t.id),
  )

  return {
    optimisticTransactions: visibleTransactions,
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
