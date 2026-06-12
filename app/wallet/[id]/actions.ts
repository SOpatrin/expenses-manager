'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { DEV_USER_ID } from '@/app/_dev'
import { createTransaction, deleteTransaction } from '@/lib/transactions'

const schema = z.object({
  amount: z.coerce.number().positive(),
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
  const parsed = schema.safeParse({
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category') || undefined,
    description: formData.get('description') || undefined,
    date: formData.get('date'),
  })

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0].message }
  }

  await createTransaction(DEV_USER_ID, walletId, parsed.data)

  revalidatePath(`/wallet/${walletId}`)
  return { status: 'success' }
}

export async function deleteTransactionAction(
  walletId: string,
  transactionId: string,
): Promise<void> {
  await deleteTransaction(DEV_USER_ID, walletId, transactionId)
  revalidatePath(`/wallet/${walletId}`)
}
