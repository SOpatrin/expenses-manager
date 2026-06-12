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
