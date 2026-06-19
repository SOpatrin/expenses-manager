import { eq } from 'drizzle-orm'
import { db } from './db'
import { users } from './schema'

type ScanCounters = {
  receiptScansToday: number
  receiptScansResetAt: Date | null
  receiptScanLimit: number
}

type ScanDecision = {
  allowed: boolean
  limit?: number
  set?: { receiptScansToday: number; receiptScansResetAt?: Date }
}

// Чистое решение по лимиту: принимает текущие счётчики и `now` явно, чтобы
// логику сброса можно было тестировать без мокирования системного времени.
export function nextScanState(user: ScanCounters, now: Date): ScanDecision {
  const needsReset =
    !user.receiptScansResetAt || user.receiptScansResetAt <= now

  if (needsReset) {
    const resetAt = new Date(now)
    resetAt.setDate(resetAt.getDate() + 1)
    resetAt.setHours(0, 0, 0, 0)
    return {
      allowed: true,
      set: { receiptScansToday: 1, receiptScansResetAt: resetAt },
    }
  }

  if (user.receiptScansToday >= user.receiptScanLimit) {
    return { allowed: false, limit: user.receiptScanLimit }
  }

  return {
    allowed: true,
    set: { receiptScansToday: user.receiptScansToday + 1 },
  }
}

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

  // NB: read-then-write не атомарен — два параллельных скана одного юзера могут
  // слегка превысить лимит. Для пета на одного юзера это acceptable.
  const decision = nextScanState(user, new Date())

  if (decision.set) {
    await db.update(users).set(decision.set).where(eq(users.id, userId))
  }

  return { allowed: decision.allowed, limit: decision.limit }
}
