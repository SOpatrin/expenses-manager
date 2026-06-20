import { describe, expect, it } from 'vitest'
import type { CategoryKey } from './categories'
import { filterTransactions } from './filters'
import type { Transaction } from './transactions'

function tx(partial: Partial<Transaction> & { date: string }): Transaction {
  return {
    id: crypto.randomUUID(),
    walletId: 'w1',
    createdBy: 'u1',
    amount: 100,
    currency: 'USD',
    type: 'expense',
    category: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  }
}

const txs: Transaction[] = [
  tx({ date: '2024-01-10', type: 'expense', category: 'food' }),
  tx({ date: '2024-02-15', type: 'income', category: 'salary' }),
  tx({ date: '2024-03-20', type: 'expense', category: 'transport' }),
]

describe('filterTransactions', () => {
  it('без фильтров возвращает всё', () => {
    expect(filterTransactions(txs, {})).toHaveLength(3)
  })

  it('фильтрует по типу', () => {
    const r = filterTransactions(txs, { type: 'income' })
    expect(r).toHaveLength(1)
    expect(r[0].category).toBe('salary')
  })

  it('фильтрует по категории', () => {
    const r = filterTransactions(txs, { category: 'food' as CategoryKey })
    expect(r).toHaveLength(1)
    expect(r[0].date).toBe('2024-01-10')
  })

  it('фильтрует по диапазону дат (включительно)', () => {
    const r = filterTransactions(txs, { from: '2024-02-01', to: '2024-03-20' })
    expect(r.map((t) => t.date)).toEqual(['2024-02-15', '2024-03-20'])
  })

  it('комбинирует условия', () => {
    const r = filterTransactions(txs, { type: 'expense', from: '2024-02-01' })
    expect(r).toHaveLength(1)
    expect(r[0].category).toBe('transport')
  })
})
