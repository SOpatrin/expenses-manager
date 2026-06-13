'use server'

import { AuthError } from 'next-auth'
import { cookies } from 'next/headers'

import { signIn } from '@/auth'
import { createGuestUser } from '@/lib/guest'

const GUEST_TOKEN_COOKIE = 'guest-token'
const GUEST_TOKEN_MAX_AGE = 60 * 60 * 24 * 365 // 1 год

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

export async function signInAsGuest(callbackUrl: string) {
  const jar = await cookies()
  const existing = jar.get(GUEST_TOKEN_COOKIE)?.value

  let guestToken = existing

  if (!guestToken) {
    const guest = await createGuestUser()
    guestToken = guest.guestToken
    jar.set(GUEST_TOKEN_COOKIE, guestToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: GUEST_TOKEN_MAX_AGE,
      path: '/',
    })
  }

  await signIn('credentials', { guestToken, redirectTo: callbackUrl })
}
