import { describe, expect, it } from 'vitest'
import { formatMoney, formatNumber } from './format'

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
