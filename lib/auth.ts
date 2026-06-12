import { redirect } from 'next/navigation'

import { auth } from '@/auth'

export async function requireUserId(): Promise<string> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')
  return userId
}
