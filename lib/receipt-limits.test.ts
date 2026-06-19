import { describe, expect, it } from 'vitest'
import { nextScanState } from './receipt-limits'

const NOW = new Date('2024-01-15T12:00:00Z')

describe('nextScanState', () => {
  it('сбрасывает счётчик когда resetAt в прошлом', () => {
    const decision = nextScanState(
      {
        receiptScansToday: 5,
        receiptScansResetAt: new Date('2024-01-15T00:00:00Z'),
        receiptScanLimit: 5,
      },
      NOW,
    )

    expect(decision.allowed).toBe(true)
    expect(decision.set?.receiptScansToday).toBe(1)
    expect(decision.set?.receiptScansResetAt).toBeInstanceOf(Date)
  })

  it('сбрасывает счётчик когда resetAt ещё не выставлен', () => {
    const decision = nextScanState(
      {
        receiptScansToday: 0,
        receiptScansResetAt: null,
        receiptScanLimit: 5,
      },
      NOW,
    )

    expect(decision.allowed).toBe(true)
    expect(decision.set?.receiptScansToday).toBe(1)
  })

  it('инкрементит счётчик под лимитом', () => {
    const decision = nextScanState(
      {
        receiptScansToday: 2,
        receiptScansResetAt: new Date('2024-01-16T00:00:00Z'),
        receiptScanLimit: 5,
      },
      NOW,
    )

    expect(decision.allowed).toBe(true)
    expect(decision.set?.receiptScansToday).toBe(3)
    expect(decision.set?.receiptScansResetAt).toBeUndefined()
  })

  it('блокирует на лимите и возвращает limit', () => {
    const decision = nextScanState(
      {
        receiptScansToday: 5,
        receiptScansResetAt: new Date('2024-01-16T00:00:00Z'),
        receiptScanLimit: 5,
      },
      NOW,
    )

    expect(decision.allowed).toBe(false)
    expect(decision.limit).toBe(5)
    expect(decision.set).toBeUndefined()
  })
})
