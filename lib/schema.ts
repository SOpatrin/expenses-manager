import {
  boolean,
  customType,
  date,
  integer,
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

// ── Auth.js tables ────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  password: text('password'),
  isGuest: boolean('is_guest').notNull().default(false),
  guestToken: text('guest_token').unique(),
  receiptScansToday: integer('receipt_scans_today').notNull().default(0),
  receiptScansResetAt: timestamp('receipt_scans_reset_at'),
  receiptScanLimit: integer('receipt_scan_limit').notNull().default(5),
})

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
)

// ── App tables ────────────────────────────────────────────────────────────────

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
])
export const memberRoleEnum = pgEnum('member_role', ['owner', 'member'])

export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const walletMembers = pgTable(
  'wallet_members',
  {
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.walletId, t.userId] })],
)

export const walletInvites = pgTable('wallet_invites', {
  token: uuid('token').defaultRandom().primaryKey(),
  walletId: uuid('wallet_id')
    .notNull()
    .references(() => wallets.id, { onDelete: 'cascade' }),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: text('email'),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletId: uuid('wallet_id')
    .notNull()
    .references(() => wallets.id),
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
