'use client'

import { useEffect } from 'react'

import { useLocalStorage } from './useLocalStorage'

export type Theme = 'light' | 'dark' | 'system'

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
  const [theme, setThemeRaw] = useLocalStorage('theme', 'system')

  useEffect(() => {
    applyTheme(theme as Theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return {
    theme: theme as Theme,
    setTheme: setThemeRaw as (t: Theme) => void,
  }
}
