import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: SheetProps) {
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="animate-fade-in-soft absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'animate-slide-up relative flex max-h-[92dvh] w-full flex-col rounded-t-[28px] border border-white/70 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] sm:animate-pop-in sm:rounded-[28px]',
          SIZES[size],
          className,
        )}
      >
        <div className="flex items-start gap-3 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            aria-label="Close"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {children}
        </div>
        {footer && (
          <div className="border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
