'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDict } from '@/app/_i18n'
import type { Locale } from '@/lib/i18n'

import { loginWithCredentials } from '../actions'

export function LoginForm({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const searchParams = useSearchParams()
  const raw = searchParams.get('callbackUrl') ?? '/'
  const callbackUrl = raw.startsWith('/') ? raw : '/'
  const [error, action, isPending] = useActionState(
    loginWithCredentials.bind(null, callbackUrl),
    null,
  )

  return (
    <form action={action} className="space-y-3">
      <Input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className="w-full"
      />
      <Input
        name="password"
        type="password"
        placeholder={t.auth.password}
        autoComplete="current-password"
        required
        className="w-full"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t.auth.signingIn : t.auth.signIn}
      </Button>
    </form>
  )
}
