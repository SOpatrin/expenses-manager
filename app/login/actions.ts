'use server'

import { AuthError } from 'next-auth'

import { signIn } from '@/auth'

export async function loginWithCredentials(
  callbackUrl: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: callbackUrl,
    })
  } catch (e) {
    if (e instanceof AuthError) return 'Неверный email или пароль'
    throw e
  }
  return null
}

export async function signInWithGoogle(callbackUrl: string) {
  await signIn('google', { redirectTo: callbackUrl })
}
