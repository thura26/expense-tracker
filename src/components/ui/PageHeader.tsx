import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  backTo?: string
  onBack?: () => void
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  backTo,
  onBack,
  actions,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate()
  const showBack = Boolean(backTo || onBack)

  return (
    <header className={cn('mb-5 sm:mb-7', className)}>
      <div className="flex items-start gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => (onBack ? onBack() : backTo ? navigate(backTo) : navigate(-1))}
            className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
            aria-label="Go back"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-600">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-[24px] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  )
}
