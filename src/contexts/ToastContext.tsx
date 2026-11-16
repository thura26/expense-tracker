import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react'
import type { ToastType } from '@/types'
import { cn } from '@/lib/utils'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

type ToastFn = (message: string, type?: ToastType) => void

const ToastContext = createContext<ToastFn | null>(null)

const ICONS = {
  success: CheckCircle,
  error: WarningCircle,
  info: Info,
} satisfies Record<ToastType, typeof Info>

const TONES: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-white text-emerald-900',
  error: 'border-rose-200 bg-white text-rose-900',
  info: 'border-sky-200 bg-white text-sky-950',
}

const ICON_TONES: Record<ToastType, string> = {
  success: 'bg-emerald-100 text-emerald-600',
  error: 'bg-rose-100 text-rose-600',
  info: 'bg-sky-100 text-sky-600',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)
  const timersRef = useRef<number[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback<ToastFn>(
    (message, type = 'info') => {
      const id = ++idRef.current
      setItems((current) => [...current.slice(-3), { id, message, type }])
      const timer = window.setTimeout(() => dismiss(id), 4200)
      timersRef.current.push(timer)
    },
    [dismiss],
  )

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const value = useMemo(() => toast, [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex flex-col items-center gap-2 px-4 sm:top-6"
      >
        {items.map((item) => {
          const Icon = ICONS[item.type]
          return (
            <div
              key={item.id}
              className={cn(
                'animate-toast-in pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_40px_-20px_rgba(2,132,199,0.45)]',
                TONES[item.type],
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
                  ICON_TONES[item.type],
                )}
              >
                <Icon size={18} weight="fill" />
              </span>
              <p className="min-w-0 flex-1 pt-1 text-sm font-semibold leading-snug">
                {item.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="grid size-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
