import { cn } from '@/lib/utils'

interface LogoProps {
  light?: boolean
  compact?: boolean
  className?: string
  markClassName?: string
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-[15px] bg-gradient-to-br from-sky-400 via-sky-500 to-sky-700 shadow-[0_10px_20px_-10px_rgba(2,132,199,0.9)]',
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute -right-2 -top-2 size-6 rounded-full bg-white/25 blur-[1px]" />
      <svg viewBox="0 0 32 32" className="relative size-7" fill="none">
        <rect x="4.5" y="9" width="23" height="16" rx="5" fill="white" fillOpacity="0.96" />
        <rect x="8" y="5.5" width="16" height="8" rx="3.5" fill="white" fillOpacity="0.55" />
        <rect x="8.5" y="17.5" width="3.2" height="4.5" rx="1.2" fill="#0EA5E9" />
        <rect x="13.4" y="15" width="3.2" height="7" rx="1.2" fill="#0EA5E9" />
        <rect x="18.3" y="12.5" width="3.2" height="9.5" rx="1.2" fill="#0EA5E9" />
        <circle cx="24" cy="19.5" r="2.2" fill="#BAE6FD" />
      </svg>
    </span>
  )
}

export function Logo({ light = false, compact = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && (
        <span
          className={cn(
            'text-[19px] font-extrabold tracking-[-0.04em]',
            light ? 'text-white' : 'text-slate-900',
          )}
        >
          Money<span className={light ? 'text-sky-200' : 'text-sky-600'}>Track</span>
        </span>
      )}
    </div>
  )
}
