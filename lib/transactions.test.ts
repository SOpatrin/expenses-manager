import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { transactions, users, walletMembers, wallets } from './schema'
import {
  createTransaction,
  getTransactions,
  updateTransaction,
} from './transactions'

const TEST_USER_ID = 'test-user-transactions'

describe('transactions', () => {
  let walletId: string

  beforeEach(async () => {
    await db
      .insert(users)
      .values({ id: TEST_USER_ID, name: 'Test User' })
      .onConflictDoNothing()

    const [wallet] = await db
      .insert(wallets)
      .values({ name: 'Test wallet' })
      .returning()
    walletId = wallet.id

    await db
      .insert(walletMembers)
      .values({ walletId, userId: TEST_USER_ID, role: 'owner' })
  })

  afterEach(async () => {
    await db.delete(transactions).where(eq(transactions.walletId, walletId))
    await db.delete(wallets).where(eq(wallets.id, walletId))
    await db.delete(users).where(eq(users.id, TEST_USER_ID))
  })

  describe('createTransaction', () => {
    it('создаёт транзакцию и возвращает её с корректными полями', async () => {
      const result = await createTransaction(TEST_USER_ID, walletId, {
        amount: 350,
        currency: 'RSD',
        type: 'expense',
        category: 'food',
        date: '2024-01-15',
      })

      expect(result.amount).toBe(350)
      expect(result.currency).toBe('RSD')
      expect(result.type).toBe('expense')
      expect(result.category).toBe('food')
      expect(result.walletId).toBe(walletId)
      expect(result.createdBy).toBe(TEST_USER_ID)
    })

    it('бросает ошибку если userId не имеет доступа к кошельку', async () => {
      await expect(
        createTransaction('stranger', walletId, {
          amount: 100,
          currency: 'RSD',
          type: 'expense',
          date: '2024-01-15',
        }),
      ).rejects.toThrow('Access denied')
    })
  })

  describe('getTransactions', () => {
    it('возвращает список, отсортированный по date DESC', async () => {
      await createTransaction(TEST_USER_ID, walletId, {
        amount: 100,
        currency: 'RSD',
        type: 'expense',
        date: '2024-01-10',
      })
      await createTransaction(TEST_USER_ID, walletId, {
        amount: 200,
        currency: 'RSD',
        type: 'income',
        date: '2024-01-15',
      })

      const result = await getTransactions(TEST_USER_ID, walletId)

      expect(result).toHaveLength(2)
      expect(result[0].date).toBe('2024-01-15')
      expect(result[1].date).toBe('2024-01-10')
    })

    it('бросает ошибку если userId не имеет доступа к кошельку', async () => {
      await expect(getTransactions('stranger', walletId)).rejects.toThrow(
        'Access denied',
      )
    })
  })

  describe('updateTransaction', () => {
    it('бросает ошибку если транзакция не найдена', async () => {
      await expect(
        updateTransaction(TEST_USER_ID, walletId, crypto.randomUUID(), {
          amount: 999,
        }),
      ).rejects.toThrow('Transaction not found or access denied')
    })
  })
})
