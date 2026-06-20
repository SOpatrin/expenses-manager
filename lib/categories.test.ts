import { describe, expect, it } from 'vitest'
import {
  CATEGORIES,
  CATEGORY_KEYS,
  getCategory,
  suggestCategory,
} from './categories'

describe('categories', () => {
  describe('CATEGORIES / CATEGORY_KEYS', () => {
    it('согласованы по ключам и порядку', () => {
      expect(CATEGORIES.map((c) => c.key)).toEqual([...CATEGORY_KEYS])
    })

    it('содержит other как фолбэк-ключ', () => {
      expect(CATEGORY_KEYS).toContain('other')
    })
  })

  describe('getCategory', () => {
    it('возвращает мету по известному ключу', () => {
      expect(getCategory('food')).toEqual({
        key: 'food',
        label: 'Еда',
        icon: '🍔',
      })
    })

    it('возвращает undefined для неизвестного ключа', () => {
      expect(getCategory('такси в аэропорт')).toBeUndefined()
    })
  })

  describe('suggestCategory', () => {
    it('матчит по ключевому слову', () => {
      expect(suggestCategory('Такси в аэропорт')).toBe('transport')
      expect(suggestCategory('обед в кафе')).toBe('food')
      expect(suggestCategory('аптека')).toBe('health')
    })

    it('матчит расширенный словарь (из реальных заметок)', () => {
      expect(suggestCategory('Пицца')).toBe('food')
      expect(suggestCategory('Wolt')).toBe('food')
      expect(suggestCategory('Лидл')).toBe('groceries')
      expect(suggestCategory('Продукти')).toBe('groceries')
      expect(suggestCategory('Массаж')).toBe('health')
      expect(suggestCategory('Танцы')).toBe('fun')
      expect(suggestCategory('Ютуб премиум')).toBe('fun')
      expect(suggestCategory('Электроника')).toBe('shopping')
      expect(suggestCategory('Подписка claude')).toBe('bills')
    })

    it('не зависит от регистра и пробелов', () => {
      expect(suggestCategory('  ЗАРПЛАТА  ')).toBe('salary')
    })

    it('падает в other без совпадений', () => {
      expect(suggestCategory('абвгдеёж')).toBe('other')
    })

    it('падает в other для пустого/отсутствующего текста', () => {
      expect(suggestCategory('')).toBe('other')
      expect(suggestCategory(null)).toBe('other')
      expect(suggestCategory(undefined)).toBe('other')
    })
  })
})
