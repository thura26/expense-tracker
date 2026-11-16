import { clamp } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  tone?: 'sky' | 'emerald' | 'amber' | 'rose' | 'white'
  className?: string
  trackClassName?: string
}

const TONES = {
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  white: 'bg-white',
}

export function ProgressBar({
  value,
  tone = 'sky',
  className,
  trackClassName,
}: ProgressBarProps) {
  const width = clamp(value, 0, 100)
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', trackClassName)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', TONES[tone], className)}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
