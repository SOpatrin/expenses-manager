'use client'

// Клиентская сторона локали поверх общего CookiesProvider (как валюта).
// setLocale пишет cookie и делает router.refresh(): клиентский текст
// обновляется мгновенно через контекст, серверный — после refresh
// (он же инвалидирует client router cache со старой локалью).

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { useCookieState } from '@/app/_hooks/useCookieState'
import { type Locale, normalizeLocale } from '@/lib/i18n'
import { type Dict, getDict } from './index'

export function useLocale(): {
  locale: Locale
  setLocale: (l: Locale) => void
} {
  const [raw, setRaw] = useCookieState('locale')
  const router = useRouter()
  const locale = normalizeLocale(raw)
  const setLocale = useCallback(
    (l: Locale) => {
      setRaw(l)
      router.refresh()
    },
    [setRaw, router],
  )
  return { locale, setLocale }
}

export function useT(): Dict {
  return getDict(useLocale().locale)
}
