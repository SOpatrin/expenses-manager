import {
  customType,
  date,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

// хранит копейки в БД, снаружи работаем в рублях
const money = customType<{ data: number; driverData: number }>({
  dataType() {
    return 'integer'
  },
  fromDriver(val) {
    return val / 100
  },
  toDriver(val) {
    return Math.round(val * 100)
  },
})

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
])
export const memberRoleEnum = pgEnum('member_role', ['owner', 'member'])

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const accountMembers = pgTable(
  'account_members',
  {
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id),
    userId: text('user_id').notNull(),
    role: memberRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.accountId, t.userId] })],
)

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id),
  createdBy: text('created_by').notNull(),
  amount: money('amount').notNull(),
  currency: text('currency').notNull().default('RUB'),
  type: transactionTypeEnum('type').notNull(),
  category: text('category'),
  description: text('description'),
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
})
