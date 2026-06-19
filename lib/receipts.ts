import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

import { CURRENCIES, type Currency, TX_TYPES } from './currencies'

export type ReceiptDraft = {
  amount: number
  currency: Currency
  type: 'expense' | 'income'
  category: string
  date: string
}

const ReceiptDraftSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(CURRENCIES),
  type: z.enum(TX_TYPES),
  category: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const client = new Anthropic()

export async function parseReceiptImage(
  imageDataUrl: string,
): Promise<ReceiptDraft> {
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) throw new Error('Неверный формат изображения')

  const mediaType = match[1] as
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp'
    | 'image/gif'
  const base64Data = match[2]

  const today = new Date().toISOString().split('T')[0]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: `You are a receipt parser. Extract transaction data and return ONLY a valid JSON object — no markdown, no explanation.

Output format:
{"amount": number, "currency": "RSD"|"RUB"|"USD"|"EUR", "type": "expense"|"income", "category": string, "date": "YYYY-MM-DD"}

Field rules:
- amount: the FINAL amount the customer paid. Find the grand total line: УКУПНО / ЗА НАПЛАТУ / TOTAL / ИТОГО / Готовина / К оплате. NEVER take a VAT/tax line (ПДВ, НДС, Порез, PDV, Tax) — those are sub-components of the total, not the total itself.
- currency: infer from currency symbols or text on the receipt (€→EUR, $→USD, ₽/руб→RUB, дин/din/RSD→RSD). Default: RSD.
- type: "expense" for purchases/receipts, "income" only if it is clearly a sales receipt or refund to the customer.
- category: one short descriptive word in the receipt's language (e.g. "Продукты", "Ресторан", "Козметика", "Transport", "Горivo").
- date: transaction date from the receipt (YYYY-MM-DD). If not found, use ${today}.`,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Data },
          },
          { type: 'text', text: 'Parse this receipt.' },
        ],
      },
    ],
  })

  const block = response.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text')
    throw new Error('Не удалось распознать чек')

  const cleaned = block.text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  let raw: unknown
  try {
    raw = JSON.parse(cleaned)
  } catch {
    console.error('[receipts] JSON parse failed, raw text:', block.text)
    throw new Error('Не удалось распознать чек')
  }

  const parsed = ReceiptDraftSchema.safeParse(raw)
  if (!parsed.success) {
    console.error(
      '[receipts] Zod validation failed:',
      parsed.error.issues,
      'raw:',
      raw,
    )
    throw new Error('Не удалось распознать чек')
  }

  return parsed.data
}
