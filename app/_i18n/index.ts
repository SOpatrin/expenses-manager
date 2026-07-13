// Точка входа словарей. Оба словаря маленькие и попадают в клиентский бандл —
// это осознанно: переключение языка на клиенте мгновенное, без запроса.

import type { Locale } from '@/lib/i18n'
import { type Dict, ru } from './dictionaries/ru'
import { en } from './dictionaries/en'

export type { Dict }

const dictionaries: Record<Locale, Dict> = { ru, en }

export function getDict(locale: Locale): Dict {
  return dictionaries[locale]
}
