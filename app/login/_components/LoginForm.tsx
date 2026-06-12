'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const callbackUrl =
      new URLSearchParams(window.location.search).get('callbackUrl') || '/'
    startTransition(async () => {
      const result = await signIn('credentials', {
        email: data.get('email'),
        password: data.get('password'),
        redirect: false,
        callbackUrl,
      })
      if (result?.error) {
        setError('Неверный email или пароль')
      } else {
        router.push(callbackUrl)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
