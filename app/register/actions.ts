'use server'

import { z } from 'zod'

import { signIn } from '@/auth'
import { getT } from '@/app/_i18n/server'
import type { Dict } from '@/app/_i18n'
import { createUser, EmailTakenError } from '@/lib/users'

const makeSchema = (t: Dict) =>
  z
    .object({
      email: z.string().email(t.auth.invalidEmail),
      password: z.string().min(8, t.auth.passwordMin),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
      message: t.auth.passwordsMismatch,
      path: ['confirm'],
    })

export async function registerWithCredentials(
  callbackUrl: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const { t } = await getT()
  const parsed = makeSchema(t).safeParse({
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
    if (e instanceof EmailTakenError) return t.auth.emailTaken
    throw e
  }

  await signIn('credentials', { email, password, redirectTo: callbackUrl })
  return null
}
