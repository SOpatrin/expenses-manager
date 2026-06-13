import bcrypt from 'bcryptjs'

import { db } from '../lib/db'
import { users } from '../lib/schema'

if (process.env.NODE_ENV === 'production') {
  console.error('Seed scripts are not allowed in production')
  process.exit(1)
}

const PASSWORD = 'Test1234!'

const TEST_USERS = [
  { name: 'Alice Dev', email: 'alice@test.dev' },
  { name: 'Bob Dev', email: 'bob@test.dev' },
]

async function main() {
  const password = await bcrypt.hash(PASSWORD, 10)

  for (const u of TEST_USERS) {
    const [user] = await db
      .insert(users)
      .values({ ...u, password })
      .onConflictDoUpdate({ target: users.email, set: { password } })
      .returning({ id: users.id, email: users.email })
    console.log('upserted:', user.email, user.id)
  }
}

main().catch(console.error)
