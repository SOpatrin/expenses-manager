import { NativeSelect } from '@/components/ui/native-select'
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
  return (
    <form
      action={onSave}
      className="flex flex-col gap-2 py-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex gap-2">
        <input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={t.amount}
          required
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <NativeSelect name="type" defaultValue={t.type} className="py-1.5">
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
        </NativeSelect>
      </div>
      <div className="flex gap-2">
        <input
          name="category"
          type="text"
          defaultValue={t.category ?? ''}
          placeholder="Категория"
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="date"
          type="date"
          defaultValue={t.date}
          required
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 disabled:pointer-events-none dark:hover:bg-zinc-800"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Сохранить
        </button>
      </div>
    </form>
  )
}
