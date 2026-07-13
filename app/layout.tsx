import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from '@/components/ui/sonner'
import { PwaRegister } from './_components/PwaRegister'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#18181b',
}

// Статичные метаданные, а не generateMetadata(): под cacheComponents чтение
// cookies() в root metadata ломает статическую прегенерацию служебных страниц
// вроде /_not-found (next-prerender-dynamic-metadata). Нейтральный
// англоязычный текст — цена почти нулевая для auth-gated PWA.
export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Personal income & expense tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Expenses',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'system';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');var m=document.cookie.match(/(?:^|; )locale=(en|ru)/);if(m)document.documentElement.lang=m[1]})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  )
}
