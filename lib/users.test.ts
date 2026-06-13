import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { db } from './db'
import { users } from './schema'
import { createUser, EmailTakenError } from './users'

const TEST_EMAIL = 'test-register@example.com'

beforeEach(async () => {
  await db.delete(users).where(eq(users.email, TEST_EMAIL))
})

afterEach(async () => {
  await db.delete(users).where(eq(users.email, TEST_EMAIL))
})

describe('createUser', () => {
  it('создаёт пользователя и возвращает id', async () => {
    const user = await createUser(TEST_EMAIL, 'password123')
    expect(user.id).toBeDefined()
  })

  it('хэширует пароль — в БД нет открытого текста', async () => {
    await createUser(TEST_EMAIL, 'password123')
    const [row] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.email, TEST_EMAIL))
      .limit(1)
    expect(row.password).not.toBe('password123')
    expect(row.password).toMatch(/^\$2[ab]\$/)
  })

  it('сохраняет name если передан', async () => {
    await createUser(TEST_EMAIL, 'password123', 'Иван')
    const [row] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.email, TEST_EMAIL))
      .limit(1)
    expect(row.name).toBe('Иван')
  })

  it('бросает EmailTakenError при дублирующемся email', async () => {
    await createUser(TEST_EMAIL, 'password123')
    await expect(createUser(TEST_EMAIL, 'other')).rejects.toThrow(
      EmailTakenError,
    )
  })
})
