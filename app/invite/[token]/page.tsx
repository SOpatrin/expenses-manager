import { notFound } from 'next/navigation'

import { acceptInviteAction } from '@/app/actions/invites'
import { Button } from '@/components/ui/button'
import { getInvite } from '@/lib/invites'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invite = await getInvite(token)

  if (!invite) notFound()

  if (invite.acceptedAt) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16 text-center">
        <p className="text-zinc-500">Это приглашение уже использовано.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16 text-center">
      <p className="mb-1 text-sm text-zinc-400">
        {invite.invitedByName ?? 'Кто-то'} приглашает вас в кошелёк
      </p>
      <h1 className="mb-8 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
        {invite.walletName}
      </h1>
      <form action={acceptInviteAction.bind(null, token)}>
        <Button type="submit" className="w-full">
          Принять приглашение
        </Button>
      </form>
    </main>
  )
}
