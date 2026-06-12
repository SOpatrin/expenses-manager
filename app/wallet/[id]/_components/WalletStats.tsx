import type { WalletStats } from '@/lib/stats'

const fmt = (n: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n)

export default function WalletStats({ stats }: { stats: WalletStats }) {
  const balancePositive = stats.balance >= 0

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Баланс</p>
      <p
        className={`text-2xl font-semibold ${balancePositive ? 'text-zinc-800 dark:text-zinc-100' : 'text-red-500'}`}
      >
        {balancePositive ? '+' : ''}
        {fmt(stats.balance)}
      </p>
      <div className="mt-3 flex gap-4 text-sm">
        <span className="text-emerald-600 dark:text-emerald-400">
          ↑ {fmt(stats.income)}
        </span>
        <span className="text-red-500">↓ {fmt(stats.expense)}</span>
      </div>
    </div>
  )
}
