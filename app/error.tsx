'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { getDict } from '@/app/_i18n'
import { normalizeLocale } from '@/lib/i18n'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  // Error boundary вне CookiesProvider — контекст локали недоступен,
  // читаем cookie напрямую и один раз при монтировании.
  const [locale] = useState(() =>
    normalizeLocale(
      typeof document === 'undefined'
        ? null
        : (document.cookie.match(/(?:^|; )locale=(en|ru)/)?.[1] ?? null),
    ),
  )
  const t = getDict(locale)

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t.errorPage.message}
      </p>
      <Button onClick={reset}>{t.errorPage.retry}</Button>
    </div>
  )
}
