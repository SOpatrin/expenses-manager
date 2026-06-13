'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { registerWithCredentials } from '../actions'

export function RegisterForm() {
  const searchParams = useSearchParams()
  const raw = searchParams.get('callbackUrl') ?? '/'
  const callbackUrl = raw.startsWith('/') ? raw : '/'
  const [error, action, isPending] = useActionState(
    registerWithCredentials.bind(null, callbackUrl),
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
        placeholder="Пароль"
        autoComplete="new-password"
        required
        className="w-full"
      />
      <Input
        name="confirm"
        type="password"
        placeholder="Повторите пароль"
        autoComplete="new-password"
        required
        className="w-full"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Создание...' : 'Зарегистрироваться'}
      </Button>
    </form>
  )
}
