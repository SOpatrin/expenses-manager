'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { signOut } from '@/auth'
import { requireUserId } from '@/app/_session'
import { CURRENCIES, TX_TYPES } from '@/lib/currencies'
import { checkAndIncrementScanLimit } from '@/lib/receipt-limits'
import { parseReceiptImage, type ReceiptDraft } from '@/lib/receipts'
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '@/lib/transactions'
import { removeWalletMember, renameWallet } from '@/lib/wallets'

const schema = z.object({
  amount: z.preprocess(
    (v) => (typeof v === 'string' ? v.replace(',', '.') : v),
    z.coerce.number().positive(),
  ),
  currency: z.enum(CURRENCIES),
  type: z.enum(TX_TYPES),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type AddTransactionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

export async function addTransaction(
  walletId: string,
  prevState: AddTransactionState,
  formData: FormData,
): Promise<AddTransactionState> {
  const userId = await requireUserId()

  const parsed = schema.safeParse({
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    type: formData.get('type'),
    category: formData.get('category') || undefined,
    description: formData.get('description') || undefined,
    date: formData.get('date'),
  })

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0].message }
  }

  await createTransaction(userId, walletId, parsed.data)

  updateTag(`wallet-${walletId}`)
  return { status: 'success' }
}

export async function updateTransactionAction(
  walletId: string,
  transactionId: string,
  formData: FormData,
): Promise<void> {
  const userId = await requireUserId()

  const parsed = schema.safeParse({
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    type: formData.get('type'),
    category: formData.get('category') || undefined,
    description: formData.get('description') || undefined,
    date: formData.get('date'),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await updateTransaction(userId, walletId, transactionId, parsed.data)
  updateTag(`wallet-${walletId}`)
}

export async function renameWalletAction(
  walletId: string,
  name: string,
): Promise<void> {
  const userId = await requireUserId()
  await renameWallet(userId, walletId, name.trim())
  updateTag(`wallet-meta-${walletId}`)
  updateTag(`user-wallets-${userId}`)
}

export async function removeWalletMemberAction(
  walletId: string,
  targetUserId: string,
): Promise<void> {
  const userId = await requireUserId()
  await removeWalletMember(userId, walletId, targetUserId)
  updateTag(`wallet-members-${walletId}`)
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' })
}

export type ScanReceiptState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: ReceiptDraft }

export async function scanReceiptAction(
  _walletId: string,
  _prevState: ScanReceiptState,
  formData: FormData,
): Promise<ScanReceiptState> {
  const userId = await requireUserId()

  const image = formData.get('image')
  if (typeof image !== 'string' || !image) {
    return { status: 'error', message: 'Изображение не передано' }
  }

  // base64 строка примерно на 33% длиннее бинарного файла; лимит ~4 MB
  if (image.length > 5_500_000) {
    return { status: 'error', message: 'Файл слишком большой' }
  }

  const { allowed, limit } = await checkAndIncrementScanLimit(userId)
  if (!allowed) {
    return {
      status: 'error',
      message: `Достигнут лимит сканирований на сегодня (${limit} в день)`,
    }
  }

  try {
    const data = await parseReceiptImage(image)
    return { status: 'success', data }
  } catch {
    return { status: 'error', message: 'Не удалось распознать чек' }
  }
}

export async function deleteTransactionAction(
  walletId: string,
  transactionId: string,
): Promise<void> {
  const userId = await requireUserId()

  await deleteTransaction(userId, walletId, transactionId)
  updateTag(`wallet-${walletId}`)
}
