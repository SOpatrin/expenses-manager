import { Suspense } from 'react'
import Link from 'next/link'

import { getT } from '@/app/_i18n/server'

import { RegisterForm } from './_components/RegisterForm'

export default async function RegisterPage() {
  const { locale, t } = await getT()

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col items-center justify-center">
      <div className="bg-card w-full max-w-sm space-y-6 rounded-xl p-8 shadow-sm">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {t.auth.registerTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Expense Tracker</p>
        </div>

        <Suspense>
          <RegisterForm locale={locale} />
        </Suspense>

        <p className="text-muted-foreground text-center text-sm">
          {t.auth.haveAccount}{' '}
          <Link href="/login" className="text-foreground underline">
            {t.auth.signIn}
          </Link>
        </p>
      </div>
    </div>
  )
}
