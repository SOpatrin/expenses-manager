import { eq } from 'drizzle-orm'
import { db } from './db'
import { users } from './schema'

export async function checkAndIncrementScanLimit(
  userId: string,
): Promise<{ allowed: boolean; limit?: number }> {
  const [user] = await db
    .select({
      receiptScansToday: users.receiptScansToday,
      receiptScansResetAt: users.receiptScansResetAt,
      receiptScanLimit: users.receiptScanLimit,
    })
    .from(users)
    .where(eq(users.id, userId))

  if (!user) return { allowed: false }

  const now = new Date()
  const needsReset =
    !user.receiptScansResetAt || user.receiptScansResetAt <= now

  if (needsReset) {
    const resetAt = new Date(now)
    resetAt.setDate(resetAt.getDate() + 1)
    resetAt.setHours(0, 0, 0, 0)

    await db
      .update(users)
      .set({ receiptScansToday: 1, receiptScansResetAt: resetAt })
      .where(eq(users.id, userId))

    return { allowed: true }
  }

  if (user.receiptScansToday >= user.receiptScanLimit) {
    return { allowed: false, limit: user.receiptScanLimit }
  }

  await db
    .update(users)
    .set({ receiptScansToday: user.receiptScansToday + 1 })
    .where(eq(users.id, userId))

  return { allowed: true }
}
