import { describe, expect, it } from 'vitest'
import { computeUnifiedStats, convertAmount } from './stats'
import type { Transaction } from './transactions'

const RATES = { USD: 1, EUR: 0.92, RUB: 89.4, RSD: 107.2 }

function tx(
  amount: number,
  currency: string,
  type: 'income' | 'expense',
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
