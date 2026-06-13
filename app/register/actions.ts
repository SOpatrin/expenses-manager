'use server'

import { z } from 'zod'

import { signIn } from '@/auth'
import { createUser, EmailTakenError } from '@/lib/users'

const schema = z
  .object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Минимум 8 символов'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
  })

export async function registerWithCredentials(
  callbackUrl: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })

  if (!parsed.success) {
    return parsed.error.issues[0].message
  }

  const { email, password } = parsed.data

  try {
    await createUser(email, password)
  } catch (e) {
    if (e instanceof EmailTakenError) return 'Этот email уже зарегистрирован'
    throw e
  }

  await signIn('credentials', { email, password, redirectTo: callbackUrl })
  return null
}
