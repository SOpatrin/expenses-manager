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
import { type CategoryKey, getCategory } from '@/lib/categories'
import type { TxType } from '@/lib/currencies'
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

// Гранулярность динамики по фактическому размаху дат, а не по имени периода:
// до ~квартала — по дням (видно много точек), шире — по месяцам.
function pickGranularity(transactions: Transaction[]): 'day' | 'month' {
  if (transactions.length < 2) return 'day'
  let min = transactions[0].date
  let max = transactions[0].date
  for (const t of transactions) {
    if (t.date < min) min = t.date
    if (t.date > max) max = t.date
  }
  const days = (Date.parse(max) - Date.parse(min)) / 86_400_000
  return days > 92 ? 'month' : 'day'
}

// Компактные подписи осей, чтобы суммы влезали по ширине: 12000 → «12k».
function shortNum(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${+(v / 1_000).toFixed(1)}k`
  return String(Math.round(v))
}

// Тултип с учётом темы и скруглением (дефолтный recharts — белый и острый).
// percentOf задан → строки с процентами.
function ChartTooltip({
  active,
  payload,
  label,
  suffix = '',
  percentOf,
}: {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number | string
    color?: string
    payload?: { fill?: string }
  }>
  label?: string
  suffix?: string
  percentOf?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {label ? <div className="mb-1 text-zinc-400">{label}</div> : null}
      {payload.map((p, i) => {
        const value = Number(p.value ?? 0)
        const pct =
          percentOf && percentOf > 0
            ? Math.round((value / percentOf) * 100)
            : null
        return (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: p.color ?? p.payload?.fill }}
            />
            <span className="text-zinc-600 dark:text-zinc-300">{p.name}</span>
            <span className="ml-2 font-medium text-zinc-800 dark:text-zinc-100">
              {nf.format(value)}
              {suffix}
              {pct !== null ? ` · ${pct}%` : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Analytics({
  transactions,
  rates,
  type,
  activeCategory,
  onCategoryChange,
}: {
  transactions: Transaction[]
  rates: Record<string, number>
  type: TxType | ''
  activeCategory: CategoryKey | ''
  onCategoryChange: (c: CategoryKey | '') => void
}) {
  const [displayCurrency] = useCookieState('display-currency')
  const target =
    displayCurrency && displayCurrency in rates ? displayCurrency : undefined
  const granularity = pickGranularity(transactions)

  // Pie следует за фильтром типа: доходы → доходы по категориям, иначе расходы.
  const pieType: 'expense' | 'income' = type === 'income' ? 'income' : 'expense'
  const pieTitle =
    pieType === 'income' ? 'Доходы по категориям' : 'Расходы по категориям'
  const byCategory = groupByCategory(
    transactions,
    target ? rates : undefined,
    target,
    pieType,
  )
  const byPeriod = groupByPeriod(
    transactions,
    granularity,
    target ? rates : undefined,
    target,
  )
  const total = byCategory.reduce((sum, s) => sum + s.total, 0)
  // Сумма в центре доната: дырка ~124px, ужимаем шрифт под длину строки.
  const totalText = nf.format(total)
  const centerFont = Math.max(
    11,
    Math.min(22, Math.floor(112 / (0.62 * Math.max(totalText.length, 1)))),
  )

  // Одна точка не образует линию — дублируем её в две, чтобы вышла
  // горизонтальная прямая (как график y = const), а не одинокая точка.
  const chartData =
    byPeriod.length === 1 ? [byPeriod[0], byPeriod[0]] : byPeriod
  // Смена набора дат → remount графика → чистая отрисовка вместо «морфинга» осей.
  const lineKey = byPeriod.map((p) => p.date).join('|')

  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400">
        Нет данных за выбранный период
      </p>
    )
  }

  const suffix = target ? ` ${target}` : ''

  return (
    <div className="flex flex-col gap-8 [&_*:focus]:outline-none [&_*:focus-visible]:outline-none">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {pieTitle}
          {target ? ` (${target})` : ''}
        </h3>
        {activeCategory ? (
          <button
            type="button"
            onClick={() => onCategoryChange('')}
            className="flex items-center gap-1.5 self-start rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            ← {getCategory(activeCategory)?.icon}{' '}
            {getCategory(activeCategory)?.label} · все категории
          </button>
        ) : byCategory.length === 0 ? (
          <p className="text-sm text-zinc-400">
            {pieType === 'income' ? 'Доходов нет' : 'Расходов нет'}
          </p>
        ) : (
          <>
            <div className="relative">
              {/* Подпись в DOM раньше графика → график и его тултип рисуются
                  сверху, а сумма видна через прозрачную дырку доната. */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span
                  style={{ fontSize: centerFont }}
                  className="font-semibold text-zinc-800 tabular-nums dark:text-zinc-100"
                >
                  {totalText}
                </span>
                {target && (
                  <span className="text-[11px] text-zinc-400">{target}</span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="total"
                    nameKey="label"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={0}
                    stroke="none"
                    animationDuration={400}
                    className="cursor-pointer"
                    onClick={(d) => {
                      const key = (d as { key?: string }).key
                      if (key) onCategoryChange(key as CategoryKey)
                    }}
                  >
                    {byCategory.map((s, i) => (
                      <Cell key={s.key} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<ChartTooltip suffix={suffix} percentOf={total} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {byCategory.map((s, i) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => onCategoryChange(s.key as CategoryKey)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  >
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
                    <span className="w-9 shrink-0 text-right text-xs text-zinc-400">
                      {total ? Math.round((s.total / total) * 100) : 0}%
                    </span>
                  </button>
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
          <LineChart
            key={lineKey}
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={44}
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => shortNum(v)}
            />
            <Tooltip content={<ChartTooltip suffix={suffix} />} />
            <Line
              type="monotone"
              dataKey="income"
              name="Доход"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Расход"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}
