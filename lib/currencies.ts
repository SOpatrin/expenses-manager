// Единый источник правды по валютам и типам транзакций.
// Используется в Zod-схемах (валидация) и в формах (рендер опций).

export const CURRENCIES = ['RSD', 'RUB', 'USD', 'EUR'] as const
export type Currency = (typeof CURRENCIES)[number]

export const TX_TYPES = ['expense', 'income'] as const
export type TxType = (typeof TX_TYPES)[number]

export const TX_TYPE_LABELS: Record<TxType, string> = {
  expense: 'Расход',
  income: 'Доход',
}
