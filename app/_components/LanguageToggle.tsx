'use client'

import { useLocale, useT } from '@/app/_i18n/client'
import type { Locale } from '@/lib/i18n'

const OPTIONS: { value: Locale; text: string }[] = [
  { value: 'ru', text: 'RU' },
  { value: 'en', text: 'EN' },
]

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale()
  const t = useT()

  return (
    <div
      className={`flex rounded-md border border-zinc-200 p-0.5 dark:border-zinc-700 ${className ?? ''}`}
    >
      {OPTIONS.map(({ value, text }) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          aria-label={`${t.language.label}: ${text}`}
          title={`${t.language.label}: ${text}`}
          className={`flex flex-1 items-center justify-center rounded px-3 py-1 transition-colors ${
            locale === value
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <span className="text-[13px] leading-none font-semibold">{text}</span>
        </button>
      ))}
    </div>
  )
}
