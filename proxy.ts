import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  if (!req.auth) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: [
    '/((?!api/auth|login|register|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon.*\\.png|icon\\.svg|apple-touch-icon\\.png).*)',
  ],
}
