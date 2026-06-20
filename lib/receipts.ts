import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

import {
  CATEGORIES,
  CATEGORY_KEYS,
  type CategoryKey,
  suggestCategory,
} from './categories'
import { CURRENCIES, type Currency, TX_TYPES } from './currencies'

export type ReceiptDraft = {
  amount: number
  currency: Currency
  type: 'expense' | 'income'
  category: CategoryKey
  description: string
  date: string
}

// Категория от модели приходит свободной строкой — нормализуем ниже до ключа.
const ReceiptResponseSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(CURRENCIES),
  type: z.enum(TX_TYPES),
  category: z.string().min(1),
  description: z.string().optional().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const categoryList = CATEGORIES.map((c) => `${c.key} (${c.label})`).join(', ')

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
{"amount": number, "currency": "RSD"|"RUB"|"USD"|"EUR", "type": "expense"|"income", "category": string, "description": string, "date": "YYYY-MM-DD"}

Field rules:
- amount: the FINAL amount the customer paid. Find the grand total line: УКУПНО / ЗА НАПЛАТУ / TOTAL / ИТОГО / Готовина / К оплате. NEVER take a VAT/tax line (ПДВ, НДС, Порез, PDV, Tax) — those are sub-components of the total, not the total itself.
- currency: infer from currency symbols or text on the receipt (€→EUR, $→USD, ₽/руб→RUB, дин/din/RSD→RSD). Default: RSD.
- type: "expense" for purchases/receipts, "income" only if it is clearly a sales receipt or refund to the customer.
- category: pick EXACTLY ONE key from this list (return the english key, NOT the label): ${categoryList}. If unsure, use "other".
- description: a short human note — the store/merchant name or the main item, in the receipt's language (e.g. "Лидл", "Кафе Sunce", "Такси", "Аптека"). Keep it under ~40 characters.
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

  const parsed = ReceiptResponseSchema.safeParse(raw)
  if (!parsed.success) {
    console.error(
      '[receipts] Zod validation failed:',
      parsed.error.issues,
      'raw:',
      raw,
    )
    throw new Error('Не удалось распознать чек')
  }

  const data = parsed.data
  // Подстраховка: если модель вернула не наш ключ (label/что-то своё) —
  // приводим к ключу по заметке/тексту категории.
  const category: CategoryKey = (CATEGORY_KEYS as readonly string[]).includes(
    data.category,
  )
    ? (data.category as CategoryKey)
    : suggestCategory(data.description || data.category)

  return {
    amount: data.amount,
    currency: data.currency,
    type: data.type,
    category,
    description: data.description.trim(),
    date: data.date,
  }
}
