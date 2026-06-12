'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { loginWithCredentials } from '../actions'

export function LoginForm() {
  const [error, action, isPending] = useActionState(loginWithCredentials, null)

  return (
    <form action={action} method="post" className="space-y-3">
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
        autoComplete="current-password"
        required
        className="w-full"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  )
}
