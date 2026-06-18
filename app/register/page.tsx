import { Suspense } from 'react'
import Link from 'next/link'

import { RegisterForm } from './_components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="bg-background flex min-h-full flex-1 flex-col items-center justify-center">
      <div className="bg-card w-full max-w-sm space-y-6 rounded-xl p-8 shadow-sm">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Регистрация</h1>
          <p className="text-muted-foreground mt-1 text-sm">Expense Tracker</p>
        </div>

        <Suspense>
          <RegisterForm />
        </Suspense>

        <p className="text-muted-foreground text-center text-sm">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-foreground underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
