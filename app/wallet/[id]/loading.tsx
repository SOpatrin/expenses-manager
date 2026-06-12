const pulse = 'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800'

export default function Loading() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      {/* заголовок */}
      <div className="mb-6 h-7 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />

      <div className="flex flex-col gap-6">
        {/* статистика */}
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <div className={`${pulse} mb-2 h-3 w-12`} />
          <div className={`${pulse} h-8 w-32`} />
          <div className="mt-3 flex gap-4">
            <div className={`${pulse} h-4 w-20`} />
            <div className={`${pulse} h-4 w-20`} />
          </div>
        </div>

        {/* форма */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className={`${pulse} h-10 flex-1`} />
            <div className={`${pulse} h-10 w-28`} />
          </div>
          <div className="flex gap-2">
            <div className={`${pulse} h-10 flex-1`} />
            <div className={`${pulse} h-10 w-36`} />
          </div>
          <div className={`${pulse} h-9 w-full`} />
        </div>

        {/* список */}
        <div className="mt-6 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1.5">
                <div className={`${pulse} h-4 w-24`} />
                <div className={`${pulse} h-3 w-16`} />
              </div>
              <div className={`${pulse} h-4 w-16`} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
