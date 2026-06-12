import type { Transaction } from './transactions'

export type WalletStats = {
  income: number
  expense: number
  balance: number
}

export function computeStats(transactions: Transaction[]): WalletStats {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
}
