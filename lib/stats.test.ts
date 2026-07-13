import { describe, expect, it } from 'vitest'
import {
  computeUnifiedStats,
  convertAmount,
  groupByCategory,
  groupByPeriod,
} from './stats'
import type { Transaction } from './transactions'

const RATES = { USD: 1, EUR: 0.92, RUB: 89.4, RSD: 107.2 }

function tx(
  amount: number,
  currency: string,
  type: 'income' | 'expense',
  extra: Partial<Transaction> = {},
): Transaction {
  return {
    id: crypto.randomUUID(),
    walletId: 'w1',
    createdBy: 'u1',
    amount,
    currency,
    type,
    category: null,
    description: null,
    date: '2024-01-01',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...extra,
  }
}

describe('convertAmount', () => {
  it('returns amount unchanged for same currency', () => {
    expect(convertAmount(100, 'USD', 'USD', RATES)).toBe(100)
  })

  it('converts USD to EUR', () => {
    expect(convertAmount(100, 'USD', 'EUR', RATES)).toBeCloseTo(92)
  })

  it('converts RUB to USD', () => {
    expect(convertAmount(894, 'RUB', 'USD', RATES)).toBeCloseTo(10)
  })

  it('returns original amount when currency missing from rates', () => {
    expect(convertAmount(100, 'GBP', 'USD', RATES)).toBe(100)
  })
})

describe('computeUnifiedStats', () => {
  it('sums income and expense in target currency', () => {
    const txs = [tx(100, 'USD', 'income'), tx(89.4, 'RUB', 'expense')]
    const result = computeUnifiedStats(txs, RATES, 'USD')
    expect(result.income).toBeCloseTo(100)
    expect(result.expense).toBeCloseTo(1)
    expect(result.balance).toBeCloseTo(99)
  })

  it('returns zero stats for empty list', () => {
    const result = computeUnifiedStats([], RATES, 'USD')
    expect(result).toEqual({ income: 0, expense: 0, balance: 0 })
  })
})

describe('groupByCategory', () => {
  it('суммирует только расходы по категориям и сортирует по убыванию', () => {
    const txs = [
      tx(30, 'USD', 'expense', { category: 'food' }),
      tx(70, 'USD', 'expense', { category: 'transport' }),
      tx(20, 'USD', 'expense', { category: 'food' }),
      tx(999, 'USD', 'income', { category: 'salary' }),
    ]
    const result = groupByCategory(txs)
    expect(result.map((s) => [s.key, s.total])).toEqual([
      ['transport', 70],
      ['food', 50],
    ])
  })

  it('пустую/неизвестную категорию относит к other', () => {
    const txs = [tx(10, 'USD', 'expense', { category: null })]
    const result = groupByCategory(txs)
    expect(result[0].key).toBe('other')
    expect(result[0].icon).toBe('📦')
  })

  it('конвертирует в целевую валюту, если заданы курсы', () => {
    const txs = [tx(89.4, 'RUB', 'expense', { category: 'food' })]
    const result = groupByCategory(txs, RATES, 'USD')
    expect(result[0].total).toBeCloseTo(1)
  })

  it('может группировать доходы вместо расходов', () => {
    const txs = [
      tx(100, 'USD', 'income', { category: 'salary' }),
      tx(50, 'USD', 'expense', { category: 'food' }),
    ]
    const result = groupByCategory(txs, undefined, undefined, 'income')
    expect(result).toEqual([{ key: 'salary', icon: '💰', total: 100 }])
  })
})

describe('groupByPeriod', () => {
  it('группирует по дню и сортирует по возрастанию даты', () => {
    const txs = [
      tx(50, 'USD', 'expense', { date: '2024-03-02' }),
      tx(100, 'USD', 'income', { date: '2024-03-01' }),
      tx(20, 'USD', 'expense', { date: '2024-03-01' }),
    ]
    const result = groupByPeriod(txs, 'day')
    expect(result).toEqual([
      { date: '2024-03-01', income: 100, expense: 20 },
      { date: '2024-03-02', income: 0, expense: 50 },
    ])
  })

  it('группирует по месяцу', () => {
    const txs = [
      tx(10, 'USD', 'expense', { date: '2024-03-15' }),
      tx(40, 'USD', 'expense', { date: '2024-03-28' }),
    ]
    const result = groupByPeriod(txs, 'month')
    expect(result).toEqual([{ date: '2024-03', income: 0, expense: 50 }])
  })
})
