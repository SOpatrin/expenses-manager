'use client'

import { Button } from '@/components/ui/button'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Что-то пошло не так.
      </p>
      <Button onClick={reset}>Повторить</Button>
    </div>
  )
}
