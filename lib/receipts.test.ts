import { describe, expect, it, vi } from 'vitest'

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}))

vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = { create: mockCreate }
  }
  return { default: MockAnthropic }
})

import { parseReceiptImage } from './receipts'

const VALID_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8AKn//2Q=='

function makeResponse(text: string) {
  return { content: [{ type: 'text', text }] }
}

describe('parseReceiptImage', () => {
  it('returns ReceiptDraft on valid response', async () => {
    mockCreate.mockResolvedValueOnce(
      makeResponse(
        JSON.stringify({
          amount: 450.5,
          currency: 'RUB',
          type: 'expense',
          category: 'Продукты',
          date: '2024-03-15',
        }),
      ),
    )

    const result = await parseReceiptImage(VALID_DATA_URL, 'user-1')

    expect(result).toEqual({
      amount: 450.5,
      currency: 'RUB',
      type: 'expense',
      category: 'Продукты',
      date: '2024-03-15',
    })
  })

  it('throws on invalid JSON response', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse('not json'))

    await expect(parseReceiptImage(VALID_DATA_URL, 'user-1')).rejects.toThrow(
      'Не удалось распознать чек',
    )
  })

  it('throws when schema validation fails', async () => {
    mockCreate.mockResolvedValueOnce(
      makeResponse(JSON.stringify({ amount: -10, currency: 'RUB' })),
    )

    await expect(parseReceiptImage(VALID_DATA_URL, 'user-1')).rejects.toThrow(
      'Не удалось распознать чек',
    )
  })

  it('throws on invalid data URL format', async () => {
    await expect(parseReceiptImage('not-a-data-url', 'user-1')).rejects.toThrow(
      'Неверный формат изображения',
    )
  })
})
