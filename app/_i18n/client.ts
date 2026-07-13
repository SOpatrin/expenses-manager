'use client'

// Клиентская сторона локали поверх общего CookiesProvider (как валюта).
// setLocale пишет cookie и делает полный reload, а не router.refresh():
// в next.config.ts включён staleTimes.dynamic (client Router Cache на 5 минут),
// и refresh() инвалидирует только текущий маршрут — уже посещённые страницы
// остаются в кэше со старой локалью до истечения staleTime. Полный reload
// сбрасывает весь client Router Cache целиком, гарантируя свежий рендер
// везде. Клиентский текст (useT()) при этом уже обновился мгновенно через
// контекст — reload лишь подтягивает серверные тексты и другие страницы.

import { useCallback } from 'react'

import { useCookieState } from '@/app/_hooks/useCookieState'
import { type Locale, normalizeLocale } from '@/lib/i18n'
import { type Dict, getDict } from './index'

export function useLocale(): {
  locale: Locale
  setLocale: (l: Locale) => void
} {
  const [raw, setRaw] = useCookieState('locale')
  const locale = normalizeLocale(raw)
  const setLocale = useCallback(
    (l: Locale) => {
      setRaw(l)
      window.location.reload()
    },
    [setRaw],
  )
  return { locale, setLocale }
}

export function useT(): Dict {
  return getDict(useLocale().locale)
}
