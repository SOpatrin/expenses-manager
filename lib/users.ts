import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { db } from './db'
import { users } from './schema'

export class EmailTakenError extends Error {}

export async function createUser(
  email: string,
  password: string,
  name?: string,
): Promise<{ id: string }> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) throw new EmailTakenError()

  const hashed = await bcrypt.hash(password, 10)

  const [user] = await db
    .insert(users)
    .values({ email, password: hashed, name: name ?? null })
    .returning({ id: users.id })

  return user
}
