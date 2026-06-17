'use client'

import { Moon, Sun } from 'lucide-react'

import { type Theme, useTheme } from '@/app/_hooks/useTheme'

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun size={14} />, label: 'Светлая' },
  {
    value: 'system',
    icon: <span className="text-[13px] leading-none font-semibold">A</span>,
    label: 'Системная',
  },
  { value: 'dark', icon: <Moon size={14} />, label: 'Тёмная' },
]

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={`flex rounded-md border border-zinc-200 p-0.5 dark:border-zinc-700 ${className ?? ''}`}
    >
      {OPTIONS.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          title={label}
          className={`flex flex-1 items-center justify-center rounded px-3 py-1 transition-colors ${
            theme === value
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
