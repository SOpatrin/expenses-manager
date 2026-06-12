'use server'

import { AuthError } from 'next-auth'

import { signIn } from '@/auth'

export async function signInWithGoogle() {
  await signIn('google', { redirectTo: '/' })
}

export async function signInWithCredentials(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return 'Неверный email или пароль'
    }
    throw e
  }
  return null
}
