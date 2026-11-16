import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  art?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  art,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[26px] border border-dashed border-sky-200 bg-white/70 px-6 py-10 text-center',
        className,
      )}
    >
      {art && <div className="mb-4 w-32 sm:w-40">{art}</div>}
      <h3 className="text-base font-extrabold tracking-tight text-slate-900">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
