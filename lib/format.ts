// Форматирование чисел/денег с учётом локали. Чистый модуль без зависимостей,
// переиспользуется ботом (там своя локаль пользователя, не только веб-UI).

import type { Locale } from './i18n'

// ru → 'ru-RU', en → 'en-US'
const INTL_TAG: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-US',
}

export function formatMoney(
  amount: number,
  currency: string,
  locale: Locale,
): string {
  return new Intl.NumberFormat(INTL_TAG[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(INTL_TAG[locale], options).format(value)
}

// date — 'YYYY-MM-DD' (формат дат в БД/lib/transactions). Всегда день.месяц.год,
// независимо от локали: строковая перестановка вместо new Date()+Intl не
// зависит от часового пояса и не превращается в M/D/YYYY для en-локали.
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}
