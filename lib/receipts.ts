import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

export type ReceiptDraft = {
  amount: number
  currency: 'RSD' | 'RUB' | 'USD' | 'EUR'
  type: 'expense' | 'income'
  category: string
  date: string
}

const ReceiptDraftSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['RSD', 'RUB', 'USD', 'EUR']),
  type: z.enum(['expense', 'income']),
  category: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const client = new Anthropic()

export async function parseReceiptImage(
  imageDataUrl: string,
  _userId: string,
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
    system: `You are a receipt parser. Extract transaction data and return ONLY valid JSON:
{"amount": number, "currency": "RSD"|"RUB"|"USD"|"EUR", "type": "expense"|"income", "category": string, "date": "YYYY-MM-DD"}

Rules:
- amount: final total paid (positive)
- currency: detect from symbols (€=EUR, $=USD, ₽/руб=RUB, дин/din/RSD=RSD), default RUB
- type: "expense" for receipts
- category: short word matching receipt language (e.g. "Продукты", "Ресторан", "Transport")
- date: from receipt; if not visible use ${today}
- Return ONLY the JSON object, no markdown, no explanation`,
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

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Не удалось распознать чек')

  let raw: unknown
  try {
    raw = JSON.parse(block.text)
  } catch {
    throw new Error('Не удалось распознать чек')
  }

  const parsed = ReceiptDraftSchema.safeParse(raw)
  if (!parsed.success) throw new Error('Не удалось распознать чек')

  return parsed.data
}
