// Пресеты периодов для фильтрации/аналитики. Чистые функции: переиспользует бот.
// Границы — строки 'YYYY-MM-DD' (как поле date у транзакции), сравниваются
// лексикографически. Открытый верх (to не задан) включает сегодня и будущее.

export type Period = 'week' | 'month' | 'quarter' | 'all' | 'custom'

export type DateRange = { from?: string; to?: string }

function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Начало текущей ISO-недели (понедельник).
function startOfWeek(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const offset = (d.getDay() + 6) % 7 // Пн=0 … Вс=6
  d.setDate(d.getDate() - offset)
  return d
}

export function getPeriodRange(
  period: Period,
  now: Date = new Date(),
): DateRange {
  switch (period) {
    case 'week':
      return { from: toYMD(startOfWeek(now)) }
    case 'month':
      return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)) }
    case 'quarter': {
      const qStartMonth = Math.floor(now.getMonth() / 3) * 3
      return { from: toYMD(new Date(now.getFullYear(), qStartMonth, 1)) }
    }
    case 'all':
    case 'custom':
      return {}
  }
}
