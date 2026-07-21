import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatMonthName,
  formatMoney,
  formatNumber,
} from './format'

// Intl вставляет неразрывный ( ) / узкий неразрывный ( ) пробел
// между разрядами в ru-выводе — нормализуем к обычному пробелу перед сравнением.
function normalizeSpaces(s: string): string {
  return s.replace(/[  ]/g, ' ')
}

describe('formatMoney', () => {
  it('форматирует в ru-RU для RUB', () => {
    expect(normalizeSpaces(formatMoney(1234.5, 'RUB', 'ru'))).toBe('1 234,5 ₽')
  })

  it('форматирует в en-US для USD', () => {
    expect(formatMoney(1234.5, 'USD', 'en')).toBe('$1,234.5')
  })

  it('округляет максимум до 2 знаков после запятой', () => {
    expect(formatMoney(10.126, 'USD', 'en')).toBe('$10.13')
  })

  it('не добавляет дробную часть для целых сумм (minimumFractionDigits: 0)', () => {
    expect(formatMoney(100, 'USD', 'en')).toBe('$100')
  })
})

describe('formatNumber', () => {
  it('форматирует число в ru-RU', () => {
    expect(normalizeSpaces(formatNumber(1234.5, 'ru'))).toBe('1 234,5')
  })

  it('форматирует число в en-US', () => {
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5')
  })

  it('поддерживает опции Intl.NumberFormat (maximumFractionDigits: 0)', () => {
    expect(formatNumber(1234.5, 'en', { maximumFractionDigits: 0 })).toBe(
      '1,235',
    )
    expect(
      normalizeSpaces(formatNumber(1234.5, 'ru', { maximumFractionDigits: 0 })),
    ).toBe('1 235')
  })
})

describe('formatDate', () => {
  it('переставляет ISO-дату в день.месяц.год', () => {
    expect(formatDate('2026-07-13')).toBe('13.07.2026')
  })

  it('не зависит от локали (одинаково для ru и en)', () => {
    expect(formatDate('2026-01-05')).toBe('05.01.2026')
  })
})

describe('formatMonthName', () => {
  it('форматирует название месяца в ru-RU', () => {
    expect(formatMonthName(new Date(2026, 6, 13), 'ru')).toBe('июль')
  })

  it('форматирует название месяца в en-US', () => {
    expect(formatMonthName(new Date(2026, 6, 13), 'en')).toBe('July')
  })
})
