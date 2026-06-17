export const SUPPORTED_CURRENCIES = ['RUB', 'USD', 'EUR', 'RSD'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

type ExchangeRateResponse = {
  result: string
  conversion_rates: Record<string, number>
}

export async function getRates(base: string): Promise<Record<string, number>> {
  const key = process.env.EXCHANGERATE_API_KEY
  if (!key) throw new Error('EXCHANGERATE_API_KEY is not set')

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${key}/latest/${base}`,
    { next: { revalidate: 86400 } },
  )
  if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`)
  const data = (await res.json()) as ExchangeRateResponse
  if (data.result !== 'success')
    throw new Error(`Exchange rate fetch failed: ${data.result}`)
  return data.conversion_rates
}
