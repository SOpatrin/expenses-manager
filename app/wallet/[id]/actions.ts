'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { signOut } from '@/auth'
import { requireUserId } from '@/lib/auth'
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
  currency: z.enum(['RSD', 'RUB', 'USD', 'EUR']),
  type: z.enum(['income', 'expense']),
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

  revalidatePath(`/wallet/${walletId}`)
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

  if (!parsed.success) return

  await updateTransaction(userId, walletId, transactionId, parsed.data)
  revalidatePath(`/wallet/${walletId}`)
}

export async function renameWalletAction(
  walletId: string,
  name: string,
): Promise<void> {
  const userId = await requireUserId()
  await renameWallet(userId, walletId, name.trim())
  revalidatePath(`/wallet/${walletId}`)
}

export async function removeWalletMemberAction(
  walletId: string,
  targetUserId: string,
): Promise<void> {
  const userId = await requireUserId()
  await removeWalletMember(userId, walletId, targetUserId)
  revalidatePath(`/wallet/${walletId}/settings`)
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' })
}

export async function deleteTransactionAction(
  walletId: string,
  transactionId: string,
): Promise<void> {
  const userId = await requireUserId()

  await deleteTransaction(userId, walletId, transactionId)
  revalidatePath(`/wallet/${walletId}`)
}
