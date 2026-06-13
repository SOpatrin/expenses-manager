import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'

import { db } from './db'
import { createGuestUser } from './guest'
import { users } from './schema'

const createdIds: string[] = []

afterEach(async () => {
  for (const id of createdIds) {
    await db.delete(users).where(eq(users.id, id))
  }
  createdIds.length = 0
})

describe('createGuestUser', () => {
  it('создаёт пользователя с isGuest=true и уникальным guestToken', async () => {
    const { userId, guestToken } = await createGuestUser()
    createdIds.push(userId)

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    expect(user.isGuest).toBe(true)
    expect(user.guestToken).toBe(guestToken)
    expect(user.email).toBeNull()
    expect(user.password).toBeNull()
  })

  it('каждый вызов создаёт разного пользователя с уникальным токеном', async () => {
    const a = await createGuestUser()
    const b = await createGuestUser()
    createdIds.push(a.userId, b.userId)

    expect(a.userId).not.toBe(b.userId)
    expect(a.guestToken).not.toBe(b.guestToken)
  })
})
