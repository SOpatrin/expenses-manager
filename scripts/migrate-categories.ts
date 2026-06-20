// Разовая data-миграция перед сменой типа столбца category (text → enum).
// Старый category работал как «заголовок» (свободный текст) — переносим его в
// description, а сам category приводим к валидному ключу через suggestCategory.
// Запускать ДО `pnpm db:migrate`, пока столбец ещё text.
//
//   tsx --env-file=.env scripts/migrate-categories.ts

import { eq, isNotNull } from 'drizzle-orm'

import { CATEGORY_KEYS, suggestCategory } from '../lib/categories'
import { db } from '../lib/db'
import { transactions } from '../lib/schema'

if (process.env.NODE_ENV === 'production') {
  console.error('Migration script is meant for dev; run carefully in prod')
  process.exit(1)
}

const VALID = new Set<string>(CATEGORY_KEYS)

async function main() {
  const rows = await db
    .select({
      id: transactions.id,
      category: transactions.category,
      description: transactions.description,
    })
    .from(transactions)
    .where(isNotNull(transactions.category))

  let migrated = 0
  for (const row of rows) {
    const oldCategory = row.category as string | null
    if (!oldCategory) continue
    // Идемпотентность: уже валидный ключ — строка обработана, не трогаем.
    if (VALID.has(oldCategory)) continue

    await db
      .update(transactions)
      .set({
        description: row.description ?? oldCategory,
        category: suggestCategory(oldCategory),
      })
      .where(eq(transactions.id, row.id))
    migrated++
  }

  console.log(`migrated ${migrated} of ${rows.length} transactions`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
