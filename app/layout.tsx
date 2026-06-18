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

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Личный трекер доходов и расходов',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Расходы',
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
            __html: `(function(){var t=localStorage.getItem('theme')||'system';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')})()`,
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
