import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getRates } from './rates'

const MOCK_RESPONSE = {
  result: 'success',
  conversion_rates: { USD: 1, EUR: 0.92, RUB: 89.4, RSD: 107.2 },
}

describe('getRates', () => {
  beforeEach(() => {
    vi.stubEnv('EXCHANGERATE_API_KEY', 'test-key')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESPONSE,
    } as Response)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('returns rates including base currency', async () => {
    const rates = await getRates('USD')
    expect(rates['USD']).toBe(1)
    expect(rates['EUR']).toBe(0.92)
    expect(rates['RUB']).toBe(89.4)
    expect(rates['RSD']).toBe(107.2)
  })

  it('returns empty object when API key is missing', async () => {
    vi.stubEnv('EXCHANGERATE_API_KEY', '')
    await expect(getRates('USD')).resolves.toEqual({})
  })

  it('throws on non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
    } as Response)
    await expect(getRates('USD')).rejects.toThrow('503')
  })

  it('throws when result is not success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'invalid-key', conversion_rates: {} }),
    } as Response)
    await expect(getRates('USD')).rejects.toThrow('invalid-key')
  })
})
