import { DrizzleAdapter } from '@auth/drizzle-adapter'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'

import { db } from '@/lib/db'
import {
  oauthAccounts,
  sessions,
  users,
  verificationTokens,
} from '@/lib/schema'

declare module 'next-auth' {
  interface Session {
    user: { id: string; isGuest: boolean } & DefaultSession['user']
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: oauthAccounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google,
    Resend({
      from: 'noreply@resend.dev',
    }),
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
        guestToken: { type: 'text' },
      },
      async authorize(credentials) {
        if (credentials?.guestToken) {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.guestToken, credentials.guestToken as string))
            .limit(1)

          return user ?? null
        }

        if (!credentials?.email || !credentials?.password) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user?.password) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        return valid ? user : null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.isGuest = (user as { isGuest?: boolean }).isGuest ?? false
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      session.user.isGuest =
        ((token as Record<string, unknown>).isGuest as boolean | undefined) ??
        false
      return session
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
})
