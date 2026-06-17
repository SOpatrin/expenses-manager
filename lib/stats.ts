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
