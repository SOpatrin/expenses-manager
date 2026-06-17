'use client'

import { useEffect, useState } from 'react'
import { SUPPORTED_CURRENCIES } from '@/lib/rates'
import {
  computeStats,
  computeUnifiedStats,
  type CurrencyStats,
} from '@/lib/stats'
import type { Transaction } from '@/lib/transactions'

const STORAGE_KEY = 'display-currency'

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function StatCard({
  currency,
  s,
  approximate,
}: {
  currency: string
  s: CurrencyStats
  approximate?: boolean
}) {
  const positive = s.balance >= 0
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Баланс</p>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {currency}
          {approximate ? ' ~' : ''}
        </span>
      </div>
      <p
        className={`text-2xl font-semibold ${positive ? 'text-zinc-800 dark:text-zinc-100' : 'text-red-500'}`}
      >
        {positive ? '+' : ''}
        {fmt(s.balance, currency)}
      </p>
      <div className="mt-3 flex gap-4 text-sm">
        <span className="text-emerald-600 dark:text-emerald-400">
          ↑ {fmt(s.income, currency)}
        </span>
        <span className="text-red-500">↓ {fmt(s.expense, currency)}</span>
      </div>
    </div>
  )
}

export default function WalletStats({
  transactions,
  rates,
}: {
  transactions: Transaction[]
  rates: Record<string, number>
}) {
  const [displayCurrency, setDisplayCurrency] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayCurrency(localStorage.getItem(STORAGE_KEY))
  }, [])

  if (transactions.length === 0) return null

  const hasRates = Object.keys(rates).length > 0

  function handleChange(value: string) {
    const next = value === '' ? null : value
    setDisplayCurrency(next)
    if (next) localStorage.setItem(STORAGE_KEY, next)
    else localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="flex flex-col gap-3">
      {hasRates && (
        <div className="flex gap-1.5">
          {(['all', ...SUPPORTED_CURRENCIES] as const).map((c) => {
            const active =
              c === 'all' ? !displayCurrency : displayCurrency === c
            return (
              <button
                key={c}
                onClick={() => handleChange(c === 'all' ? '' : c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {c === 'all' ? 'Все' : c}
              </button>
            )
          })}
        </div>
      )}

      {displayCurrency ? (
        <StatCard
          currency={displayCurrency}
          s={computeUnifiedStats(transactions, rates, displayCurrency)}
          approximate
        />
      ) : (
        Object.entries(computeStats(transactions)).map(([currency, s]) => (
          <StatCard key={currency} currency={currency} s={s} />
        ))
      )}
    </div>
  )
}
