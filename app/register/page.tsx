import { Suspense } from 'react'
import Link from 'next/link'

import { RegisterForm } from './_components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Регистрация</h1>
          <p className="mt-1 text-sm text-zinc-500">Expense Tracker</p>
        </div>

        <Suspense>
          <RegisterForm />
        </Suspense>

        <p className="text-center text-sm text-zinc-500">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-zinc-900 underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
