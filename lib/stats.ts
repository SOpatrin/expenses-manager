import { getCategory } from './categories'
import type { Transaction } from './transactions'

export type CurrencyStats = {
  income: number
  expense: number
  balance: number
}

export type WalletStats = Record<string, CurrencyStats>

export function computeStats(transactions: Transaction[]): WalletStats {
  const result: WalletStats = {}
  for (const t of transactions) {
    const cur = t.currency
    if (!result[cur]) result[cur] = { income: 0, expense: 0, balance: 0 }
    if (t.type === 'income') result[cur].income += t.amount
    else result[cur].expense += t.amount
    result[cur].balance = result[cur].income - result[cur].expense
  }
  return result
}

// rates — словарь курсов относительно одной базы (rates[base] === 1)
export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (from === to) return amount
  const fromRate = rates[from]
  const toRate = rates[to]
  if (!fromRate || !toRate) return amount
  return (amount / fromRate) * toRate
}

export function computeUnifiedStats(
  transactions: Transaction[],
  rates: Record<string, number>,
  targetCurrency: string,
): CurrencyStats {
  const result: CurrencyStats = { income: 0, expense: 0, balance: 0 }
  for (const t of transactions) {
    const converted = convertAmount(t.amount, t.currency, targetCurrency, rates)
    if (t.type === 'income') result.income += converted
    else result.expense += converted
  }
  result.balance = result.income - result.expense
  return result
}

// targetCurrency задан → суммы конвертируются в него; иначе складываются как есть.
function amountIn(
  t: Transaction,
  rates?: Record<string, number>,
  targetCurrency?: string,
): number {
  if (rates && targetCurrency) {
    return convertAmount(t.amount, t.currency, targetCurrency, rates)
  }
  return t.amount
}

export type CategorySlice = {
  key: string
  label: string
  icon: string
  total: number
}

// Суммы по категориям для pie (по умолчанию расходы; можно доходы).
// Неизвестные/пустые → бакет 'other'. Сортировка по убыванию суммы.
export function groupByCategory(
  transactions: Transaction[],
  rates?: Record<string, number>,
  targetCurrency?: string,
  type: 'expense' | 'income' = 'expense',
): CategorySlice[] {
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== type) continue
    const key = getCategory(t.category ?? '') ? t.category! : 'other'
    totals.set(key, (totals.get(key) ?? 0) + amountIn(t, rates, targetCurrency))
  }
  return [...totals.entries()]
    .map(([key, total]) => {
      const meta = getCategory(key)
      return { key, label: meta?.label ?? key, icon: meta?.icon ?? '📦', total }
    })
    .sort((a, b) => b.total - a.total)
}

export type PeriodPoint = { date: string; income: number; expense: number }

// Динамика доход/расход по времени (для line). granularity: день или месяц.
// Точки отсортированы по дате (возрастание).
export function groupByPeriod(
  transactions: Transaction[],
  granularity: 'day' | 'month' = 'day',
  rates?: Record<string, number>,
  targetCurrency?: string,
): PeriodPoint[] {
  const points = new Map<string, PeriodPoint>()
  for (const t of transactions) {
    const date = granularity === 'month' ? t.date.slice(0, 7) : t.date
    const point = points.get(date) ?? { date, income: 0, expense: 0 }
    const amount = amountIn(t, rates, targetCurrency)
    if (t.type === 'income') point.income += amount
    else point.expense += amount
    points.set(date, point)
  }
  return [...points.values()].sort((a, b) => a.date.localeCompare(b.date))
}
