import { auth } from '@/auth'
import { NextResponse } from 'next/server'

import { pickLocale } from '@/lib/i18n'

const LOCALE_COOKIE_OPTIONS = {
  path: '/',
  maxAge: 31536000,
  sameSite: 'lax' as const,
}

export default auth((req) => {
  // Первый визит без cookie локали — определяем её по Accept-Language и
  // проставляем на ответ (те же опции, что пишет клиент в useCookieState).
  const localeToSet = req.cookies.has('locale')
    ? null
    : pickLocale(req.headers.get('accept-language'))

  if (!req.auth) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', callbackUrl)
    const res = NextResponse.redirect(loginUrl)
    if (localeToSet)
      res.cookies.set('locale', localeToSet, LOCALE_COOKIE_OPTIONS)
    return res
  }

  if (localeToSet) {
    const res = NextResponse.next()
    res.cookies.set('locale', localeToSet, LOCALE_COOKIE_OPTIONS)
    return res
  }
})

export const config = {
  matcher: [
    '/((?!api/auth|login|register|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon.*\\.png|icon\\.svg|apple-touch-icon\\.png).*)',
  ],
}
