const pulse = 'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800'

export default function Loading() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className={`${pulse} h-5 w-4`} />
        <div className={`${pulse} h-7 w-28`} />
      </div>

      <ul className="mb-8 divide-y divide-zinc-100 dark:divide-zinc-800">
        {[...Array(2)].map((_, i) => (
          <li key={i} className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1.5">
              <div className={`${pulse} h-4 w-32`} />
              <div className={`${pulse} h-3 w-24`} />
            </div>
            <div className={`${pulse} h-3 w-14`} />
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <div className={`${pulse} h-5 w-20`} />
        <div className="flex gap-2">
          <div className={`${pulse} h-10 flex-1`} />
          <div className={`${pulse} h-10 w-32`} />
        </div>
      </div>
    </main>
  )
}
