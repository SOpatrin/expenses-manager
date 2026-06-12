import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Wallet } from '@/lib/wallets'

import { createWalletAction } from '../../../wallets/actions'

export function WalletSidebar({
  wallets,
  activeId,
}: {
  wallets: Wallet[]
  activeId: string
}) {
  return (
    <aside className="hidden w-44 shrink-0 flex-col px-2 py-8 lg:flex">
      <p className="mb-3 px-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
        Кошельки
      </p>
      <nav className="mb-3 flex flex-col gap-0.5">
        {wallets.map((w) => (
          <Link
            key={w.id}
            href={`/wallet/${w.id}`}
            className={`rounded-md px-2 py-2 text-sm font-medium transition-colors ${
              w.id === activeId
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
            }`}
          >
            {w.name}
          </Link>
        ))}
      </nav>
      <form action={createWalletAction} className="flex flex-col gap-2">
        <Input name="name" placeholder="Новый кошелёк" className="text-sm" />
        <Button type="submit" size="sm" variant="outline" className="w-full">
          + Создать
        </Button>
      </form>
    </aside>
  )
}
