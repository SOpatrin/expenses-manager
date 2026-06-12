'use client'

import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Transaction } from '@/lib/transactions'

function formatAmount(amount: number, type: Transaction['type']) {
  const sign = type === 'income' ? '+' : '−'
  return `${sign} ${amount.toLocaleString('ru-RU')} ₽`
}

const SWIPE_THRESHOLD = 80

function SwipeableRow({
  t,
  onDelete,
  disabled,
}: {
  t: Transaction
  onDelete: () => void
  disabled: boolean
}) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const direction = useRef<'h' | 'v' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    direction.current = null
    setDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    if (direction.current === null) {
      if (Math.abs(dx) > Math.abs(dy) && dx < 0) {
        direction.current = 'h'
      } else {
        direction.current = 'v'
        setDragging(false)
        return
      }
    }

    if (direction.current === 'v') return
    setOffset(Math.max(dx, -SWIPE_THRESHOLD - 16))
  }

  const handleTouchEnd = () => {
    setDragging(false)
    if (offset <= -SWIPE_THRESHOLD) {
      onDelete()
    }
    setOffset(0)
  }

  return (
    <li className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500">
        <span className="text-xs font-medium text-white">Удалить</span>
      </div>
      <div
        className="bg-background relative flex items-center justify-between py-3"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.25s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {t.category ?? 'Без категории'}
          </span>
          <span className="text-xs text-zinc-400">{t.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={
              t.type === 'income'
                ? 'text-sm font-semibold text-emerald-600'
                : 'text-sm font-semibold text-red-500'
            }
          >
            {formatAmount(t.amount, t.type)}
          </span>
          <button
            onClick={onDelete}
            disabled={disabled}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-400 disabled:pointer-events-none dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
            aria-label="Удалить"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </li>
  )
}

export default function TransactionList({
  transactions,
  onDelete,
  isDeleting,
}: {
  transactions: Transaction[]
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400">
        Транзакций пока нет
      </p>
    )
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {transactions.map((t) => (
        <SwipeableRow
          key={t.id}
          t={t}
          onDelete={() => onDelete(t.id)}
          disabled={isDeleting}
        />
      ))}
    </ul>
  )
}
