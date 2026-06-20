import { describe, expect, it } from 'vitest'
import { getPeriodRange } from './periods'

// Четверг, 20 июня 2024 (месяц-индекс 5, Q2).
const NOW = new Date(2024, 5, 20)

describe('getPeriodRange', () => {
  it('week → понедельник текущей недели, открытый верх', () => {
    expect(getPeriodRange('week', NOW)).toEqual({ from: '2024-06-17' })
  })

  it('month → первое число текущего месяца', () => {
    expect(getPeriodRange('month', NOW)).toEqual({ from: '2024-06-01' })
  })

  it('quarter → первое число текущего квартала', () => {
    expect(getPeriodRange('quarter', NOW)).toEqual({ from: '2024-04-01' })
  })

  it('all и custom → без границ', () => {
    expect(getPeriodRange('all', NOW)).toEqual({})
    expect(getPeriodRange('custom', NOW)).toEqual({})
  })
})
