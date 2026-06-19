import { redirect } from 'next/navigation'

import { auth } from '@/auth'

export type AuthUser = { id: string; isGuest: boolean }

export async function requireUser(): Promise<AuthUser> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')
  return { id: userId, isGuest: session.user.isGuest ?? false }
}

export async function requireUserId(): Promise<string> {
  return (await requireUser()).id
}
