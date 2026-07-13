'use client'

import { useLocale, useT } from '@/app/_i18n/client'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { CATEGORIES, type CategoryKey } from '@/lib/categories'
import { TX_TYPES, TX_TYPE_LABELS, type TxType } from '@/lib/currencies'
import type { Period } from '@/lib/periods'

const PERIODS: Period[] = ['week', 'month', 'quarter', 'all', 'custom']

export type CustomRange = { from: string; to: string }

export default function FilterBar({
  period,
  onPeriodChange,
  type,
  onTypeChange,
  category,
  onCategoryChange,
  custom,
  onCustomChange,
}: {
  period: Period
  onPeriodChange: (p: Period) => void
  type: TxType | ''
  onTypeChange: (t: TxType | '') => void
  category: CategoryKey | ''
  onCategoryChange: (c: CategoryKey | '') => void
  custom: CustomRange
  onCustomChange: (r: CustomRange) => void
}) {
  const t = useT()
  const { locale } = useLocale()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {PERIODS.map((p) => {
          const active = period === p
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {t.filters.period[p]}
            </button>
          )
        })}
      </div>

      {period === 'custom' && (
        <div className="flex gap-2">
          <Input
            type="date"
            value={custom.from}
            onChange={(e) =>
              onCustomChange({ ...custom, from: e.target.value })
            }
            className="py-1.5"
            aria-label={t.filters.fromDate}
          />
          <Input
            type="date"
            value={custom.to}
            onChange={(e) => onCustomChange({ ...custom, to: e.target.value })}
            className="py-1.5"
            aria-label={t.filters.toDate}
          />
        </div>
      )}

      <div className="flex gap-2">
        <NativeSelect
          value={type}
          onChange={(e) => onTypeChange(e.target.value as TxType | '')}
          className="w-full py-1.5"
          aria-label={t.filters.type}
        >
          <option value="">{t.filters.allTypes}</option>
          {TX_TYPES.map((txType) => (
            <option key={txType} value={txType}>
              {TX_TYPE_LABELS[locale][txType]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as CategoryKey | '')}
          className="w-full py-1.5"
          aria-label={t.filters.category}
        >
          <option value="">{t.filters.allCategories}</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.label[locale]}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  )
}
