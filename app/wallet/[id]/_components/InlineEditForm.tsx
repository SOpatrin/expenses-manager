'use client'

import { useLocale, useT } from '@/app/_i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { CATEGORIES } from '@/lib/categories'
import { CURRENCIES, TX_TYPES, TX_TYPE_LABELS } from '@/lib/currencies'
import type { Transaction } from '@/lib/transactions'

export function InlineEditForm({
  t,
  onSave,
  onCancel,
  disabled,
}: {
  t: Transaction
  onSave: (formData: FormData) => void
  onCancel: () => void
  disabled: boolean
}) {
  const dict = useT()
  const { locale } = useLocale()
  return (
    <form
      action={onSave}
      className="flex flex-col gap-2 py-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex gap-2">
        <Input
          name="amount"
          type="text"
          inputMode="decimal"
          defaultValue={t.amount}
          required
          className="w-full py-1.5"
        />
        <NativeSelect
          name="currency"
          defaultValue={t.currency}
          className="py-1.5"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect name="type" defaultValue={t.type} className="py-1.5">
          {TX_TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {TX_TYPE_LABELS[locale][ty]}
            </option>
          ))}
        </NativeSelect>
      </div>
      <Input
        name="description"
        type="text"
        defaultValue={t.description ?? ''}
        placeholder={dict.form.note}
        className="w-full py-1.5"
      />
      <div className="flex gap-2">
        <NativeSelect
          name="category"
          defaultValue={t.category ?? ''}
          className="w-full py-1.5"
        >
          <option value="">{dict.form.autoCategory}</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.label[locale]}
            </option>
          ))}
        </NativeSelect>
        <Input
          name="date"
          type="date"
          defaultValue={t.date}
          required
          className="py-1.5"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={disabled}
        >
          {dict.common.cancel}
        </Button>
        <Button type="submit" size="sm" disabled={disabled}>
          {dict.common.save}
        </Button>
      </div>
    </form>
  )
}
