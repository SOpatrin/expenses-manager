'use client'

import { useCookieState } from '@/app/_hooks/useCookieState'
import { useLocale, useT } from '@/app/_i18n/client'
import { CURRENCIES } from '@/lib/currencies'
import { formatMoney } from '@/lib/format'
import {
  computeStats,
  computeUnifiedStats,
  type CurrencyStats,
} from '@/lib/stats'
import type { Transaction } from '@/lib/transactions'

const ZERO_STATS: CurrencyStats = { income: 0, expense: 0, balance: 0 }

function StatCard({
  currency,
  s,
  approximate,
  label,
}: {
  currency: string
  s: CurrencyStats
  approximate?: boolean
  label?: string
}) {
  const t = useT()
  const { locale } = useLocale()
  const positive = s.balance >= 0
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {label ?? t.stats.balance}
        </p>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {currency}
          {approximate ? ' ~' : ''}
        </span>
      </div>
      <p
        className={`text-2xl font-semibold whitespace-nowrap ${positive ? 'text-zinc-800 dark:text-zinc-100' : 'text-red-500'}`}
      >
        {positive ? '+' : ''}
        {formatMoney(s.balance, currency, locale)}
      </p>
      <div className="mt-3 flex gap-4 text-sm">
        <span className="whitespace-nowrap text-emerald-600 dark:text-emerald-400">
          ↑ {formatMoney(s.income, currency, locale)}
        </span>
        <span className="whitespace-nowrap text-red-500">
          ↓ {formatMoney(s.expense, currency, locale)}
        </span>
      </div>
    </div>
  )
}

export default function WalletStats({
  transactions,
  rates,
  periodLabel,
  showZeroWhenEmpty,
}: {
  transactions: Transaction[]
  rates: Record<string, number>
  periodLabel?: string
  showZeroWhenEmpty?: boolean
}) {
  const t = useT()
  const [displayCurrency, setDisplayCurrency] =
    useCookieState('display-currency')

  if (transactions.length === 0 && !showZeroWhenEmpty) return null

  const availableCurrencies = CURRENCIES.filter((c) => c in rates)

  return (
    <div className="flex flex-col gap-3">
      {availableCurrencies.length > 0 && (
        <div className="flex gap-1.5">
          {(['all', ...availableCurrencies] as const).map((c) => {
            const active =
              c === 'all' ? displayCurrency === '' : displayCurrency === c
            return (
              <button
                key={c}
                onClick={() => setDisplayCurrency(c === 'all' ? '' : c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {c === 'all' ? t.common.all : c}
              </button>
            )
          })}
        </div>
      )}

      {displayCurrency !== '' && displayCurrency in rates ? (
        <StatCard
          currency={displayCurrency}
          s={computeUnifiedStats(transactions, rates, displayCurrency)}
          approximate
          label={periodLabel}
        />
      ) : transactions.length === 0 ? (
        <StatCard
          currency={displayCurrency || CURRENCIES[0]}
          s={ZERO_STATS}
          label={periodLabel}
        />
      ) : (
        Object.entries(computeStats(transactions)).map(([currency, s]) => (
          <StatCard
            key={currency}
            currency={currency}
            s={s}
            label={periodLabel}
          />
        ))
      )}
    </div>
  )
}
