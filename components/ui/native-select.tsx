import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export function NativeSelect({
  className,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'appearance-none rounded-md border border-zinc-200 bg-white py-2 pr-8 pl-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span className="select-chevron pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400">
        <ChevronDown size={14} />
      </span>
    </div>
  )
}
