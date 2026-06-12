import type { WalletStats } from '@/lib/stats'

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function WalletStats({ stats }: { stats: WalletStats }) {
  const entries = Object.entries(stats)

  if (entries.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([currency, s]) => {
        const balancePositive = s.balance >= 0
        return (
          <div
            key={currency}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Баланс</p>
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {currency}
              </span>
            </div>
            <p
              className={`text-2xl font-semibold ${balancePositive ? 'text-zinc-800 dark:text-zinc-100' : 'text-red-500'}`}
            >
              {balancePositive ? '+' : ''}
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
      })}
    </div>
  )
}
