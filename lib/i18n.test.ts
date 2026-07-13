import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, normalizeLocale, pickLocale } from './i18n'

describe('i18n', () => {
  describe('normalizeLocale', () => {
    it('распознаёт en', () => {
      expect(normalizeLocale('en')).toBe('en')
    })

    it('распознаёт ru', () => {
      expect(normalizeLocale('ru')).toBe('ru')
    })

    it('падает в дефолт для пустой строки, null и undefined', () => {
      expect(normalizeLocale('')).toBe(DEFAULT_LOCALE)
      expect(normalizeLocale(null)).toBe(DEFAULT_LOCALE)
      expect(normalizeLocale(undefined)).toBe(DEFAULT_LOCALE)
    })

    it('падает в дефолт для неизвестного языка', () => {
      expect(normalizeLocale('de')).toBe(DEFAULT_LOCALE)
    })

    it('строгое сравнение без case-insensitive: капс не матчит', () => {
      expect(normalizeLocale('EN')).toBe(DEFAULT_LOCALE)
    })
  })

  describe('pickLocale', () => {
    it('матчит первичный субтег en-US как en', () => {
      expect(pickLocale('en-US,en;q=0.9')).toBe('en')
    })

    it('матчит ru-RU раньше en в заголовке', () => {
      expect(pickLocale('ru-RU,ru;q=0.9,en;q=0.8')).toBe('ru')
    })

    it('порядок в заголовке важнее q-веса (q-веса не парсим)', () => {
      expect(pickLocale('en;q=0.8,ru;q=0.9')).toBe('en')
    })

    it('падает в дефолт для null, undefined и пустой строки', () => {
      expect(pickLocale(null)).toBe(DEFAULT_LOCALE)
      expect(pickLocale(undefined)).toBe(DEFAULT_LOCALE)
      expect(pickLocale('')).toBe(DEFAULT_LOCALE)
    })

    it('падает в дефолт, если нет ru/en среди тегов', () => {
      expect(pickLocale('de-DE,fr')).toBe(DEFAULT_LOCALE)
    })

    it('находит en во втором теге', () => {
      expect(pickLocale('fr,en-GB')).toBe('en')
    })

    it('матчит по границе языкового тега, а не по случайной подстроке', () => {
      expect(pickLocale('friend')).toBe(DEFAULT_LOCALE)
    })
  })
})
