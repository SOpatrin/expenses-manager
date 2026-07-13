// Серверные хелперы локали. Правило: вызывать только из request-динамичных
// RSC (под Suspense) и Server Actions. НИКОГДА внутри 'use cache' — иначе
// кэш зафиксирует локаль первого запроса.

import { cookies, headers } from 'next/headers'

import { type Locale, LOCALES, pickLocale } from '@/lib/i18n'
import { type Dict, getDict } from './index'

export async function getLocale(): Promise<Locale> {
  const jar = await cookies()
  const fromCookie = jar.get('locale')?.value
  if (fromCookie && (LOCALES as readonly string[]).includes(fromCookie)) {
    return fromCookie as Locale
  }
  // Первый визит без cookie — определяем по языку браузера.
  const acceptLanguage = (await headers()).get('accept-language')
  return pickLocale(acceptLanguage)
}

export async function getT(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale()
  return { locale, t: getDict(locale) }
}
