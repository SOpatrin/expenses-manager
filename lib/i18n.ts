// Локале-примитивы: список поддерживаемых языков и разбор источников локали
// (сохранённое значение, заголовок Accept-Language). Чистый модуль без зависимостей,
// переиспользуется ботом.

export const LOCALES = ['ru', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ru'

// Строгое сравнение, без case-insensitive: 'en' → 'en', всё остальное
// (в т.ч. 'EN', мусор, null/undefined) → DEFAULT_LOCALE.
export function normalizeLocale(v: string | null | undefined): Locale {
  return v === 'en' ? 'en' : DEFAULT_LOCALE
}

// Разбор заголовка Accept-Language. Порядок тегов в заголовке = приоритет
// браузера, поэтому побеждает первое найденное вхождение 'ru' или 'en' —
// q-веса (";q=0.9") сознательно не парсим, это упрощение для pet-проекта.
// Сравниваем только первичный субтег (до '-'), чтобы 'en-US' матчился,
// а случайная подстрока вроде 'friend' — нет.
export function pickLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  for (const tag of acceptLanguage.split(',')) {
    const primary = tag.split(';')[0]?.trim().split('-')[0]?.toLowerCase()
    if (primary === 'en' || primary === 'ru') return primary
  }

  return DEFAULT_LOCALE
}
