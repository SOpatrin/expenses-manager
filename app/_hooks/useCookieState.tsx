'use client'

import { createContext, use, useCallback, useState } from 'react'

type CookieValues = Record<string, string>

type CookiesContextValue = {
  values: CookieValues
  setCookie: (name: string, value: string) => void
}

const CookiesContext = createContext<CookiesContextValue | null>(null)

/**
 * Держит значения cookie, прочитанные на сервере (initial), как клиентское
 * состояние и пишет их обратно в document.cookie при изменении.
 * Засевается серверным компонентом — поэтому первый рендер уже корректный,
 * без вспышки.
 */
export function CookiesProvider({
  initial,
  children,
}: {
  initial: CookieValues
  children: React.ReactNode
}) {
  const [values, setValues] = useState(initial)

  const setCookie = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`
  }, [])

  // React 19: сам контекст как провайдер, без .Provider
  return (
    <CookiesContext value={{ values, setCookie }}>{children}</CookiesContext>
  )
}

export function useCookieState(
  name: string,
): [string, (value: string) => void] {
  // React 19: use() вместо useContext
  const ctx = use(CookiesContext)
  if (!ctx) {
    throw new Error('useCookieState должен вызываться внутри <CookiesProvider>')
  }
  const { values, setCookie } = ctx
  const value = values[name] ?? ''
  const setValue = useCallback(
    (v: string) => setCookie(name, v),
    [setCookie, name],
  )
  return [value, setValue]
}
