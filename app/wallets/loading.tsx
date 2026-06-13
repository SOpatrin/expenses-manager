const pulse = 'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800'

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className={`${pulse} h-7 w-24`} />
        <div className={`${pulse} h-4 w-10`} />
      </div>

      <ul className="mb-8 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {(['w-48', 'w-36', 'w-44'] as const).map((w, i) => (
          <li key={i} className="flex items-center justify-between py-3">
            <div className={`${pulse} h-4 ${w}`} />
            <div className={`${pulse} h-4 w-3`} />
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <div className={`${pulse} h-10 flex-1`} />
        <div className={`${pulse} h-10 w-24`} />
      </div>
    </main>
  )
}
