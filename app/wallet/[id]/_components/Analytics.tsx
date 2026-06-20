'use client'

import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useCookieState } from '@/app/_hooks/useCookieState'
import { groupByCategory, groupByPeriod } from '@/lib/stats'
import type { Transaction } from '@/lib/transactions'

const COLORS = [
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
  '#06b6d4',
  '#a855f7',
  '#71717a',
]

const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

export default function Analytics({
  transactions,
  rates,
  granularity,
}: {
  transactions: Transaction[]
  rates: Record<string, number>
  granularity: 'day' | 'month'
}) {
  const [displayCurrency] = useCookieState('display-currency')
  const target =
    displayCurrency && displayCurrency in rates ? displayCurrency : undefined

  const byCategory = groupByCategory(
    transactions,
    target ? rates : undefined,
    target,
  )
  const byPeriod = groupByPeriod(
    transactions,
    granularity,
    target ? rates : undefined,
    target,
  )

  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400">
        Нет данных за выбранный период
      </p>
    )
  }

  const suffix = target ? ` ${target}` : ''

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Расходы по категориям{target ? ` (${target})` : ''}
        </h3>
        {byCategory.length === 0 ? (
          <p className="text-sm text-zinc-400">Расходов нет</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="total"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {byCategory.map((s, i) => (
                    <Cell key={s.key} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${nf.format(Number(v ?? 0))}${suffix}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex flex-col gap-1.5 text-sm">
              {byCategory.map((s, i) => (
                <li key={s.key} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {s.icon} {s.label}
                  </span>
                  <span className="ml-auto font-medium text-zinc-800 dark:text-zinc-100">
                    {nf.format(s.total)}
                    {suffix}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Динамика{target ? ` (${target})` : ''}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={byPeriod} margin={{ top: 4, right: 8, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={40}
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => nf.format(v)}
            />
            <Tooltip
              formatter={(v) => `${nf.format(Number(v ?? 0))}${suffix}`}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Доход"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Расход"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}
