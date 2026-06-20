// Клиентская фильтрация транзакций над уже загруженным массивом. Чистая функция:
// переиспользует бот. Даты — строки 'YYYY-MM-DD', сравнение лексикографическое.

import type { CategoryKey } from './categories'
import type { TxType } from './currencies'
import type { Transaction } from './transactions'

export type TransactionFilters = {
  type?: TxType
  category?: CategoryKey
  from?: string
  to?: string
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  return transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false
    if (filters.category && t.category !== filters.category) return false
    if (filters.from && t.date < filters.from) return false
    if (filters.to && t.date > filters.to) return false
    return true
  })
}
