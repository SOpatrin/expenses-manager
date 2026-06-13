import { db } from './db'
import { users } from './schema'

export type GuestUser = {
  userId: string
  guestToken: string
}

export async function createGuestUser(): Promise<GuestUser> {
  const guestToken = crypto.randomUUID()

  const [user] = await db
    .insert(users)
    .values({ isGuest: true, guestToken })
    .returning({ id: users.id })

  return { userId: user.id, guestToken }
}
