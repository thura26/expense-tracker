import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from '@phosphor-icons/react'
import { Blobs } from '@/components/ui/Blobs'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const STEPS = [{ id: 1, label: 'Currency' }]

interface SetupShellProps {
  step?: number
  variant?: 'setup' | 'edit'
  eyebrow?: string
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  backTo?: string
  art?: ReactNode
  asideTitle?: string
  asideSubtitle?: string
}

export function SetupShell({
  step = 1,
  variant = 'setup',
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  backTo,
  art,
  asideTitle,
  asideSubtitle,
}: SetupShellProps) {
  const isSetup = variant === 'setup'
  const totalSteps = STEPS.length
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 p-10 text-white lg:flex lg:flex-col xl:p-12">
        <Blobs className="opacity-30 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_45%)]" />
        <div className="relative z-10">
          <Link to="/" aria-label="MoneyTrack home">
            <Logo light />
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-sm">
            <div className="animate-float mb-8">{art}</div>
            <h2 className="text-balance text-3xl font-extrabold leading-tight tracking-[-0.04em]">
              {asideTitle ?? 'One quick step, then you are ready.'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-sky-100/90">
              {asideSubtitle ??
                'Pick the currency you think in. Income and budgets can be added anytime from the app.'}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-2">
          {isSetup ? (
            STEPS.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition',
                  item.id === step
                    ? 'bg-white/15 text-white'
                    : item.id < step
                      ? 'text-sky-100'
                      : 'text-sky-200/60',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 place-items-center rounded-full text-[11px] font-extrabold',
                    item.id < step
                      ? 'bg-emerald-400 text-emerald-950'
                      : item.id === step
                        ? 'bg-white text-sky-700'
                        : 'bg-white/10 text-sky-200',
                  )}
                >
                  {item.id < step ? <Check size={13} weight="bold" /> : item.id}
                </span>
                {item.label}
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-[12px] leading-relaxed text-sky-100">
              Changes save straight to your profile. You can come back and adjust them
              whenever your plan changes.
            </div>
          )}
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:hidden">
          <Link to="/" aria-label="MoneyTrack home">
            <Logo />
          </Link>
          <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-sky-700 shadow-sm">
            {isSetup
              ? totalSteps > 1
                ? `Step ${step} of ${totalSteps}`
                : 'Quick setup'
              : 'Settings'}
          </span>
        </div>

        <div className="mx-auto w-full max-w-xl flex-1 px-4 pb-6 pt-2 sm:px-6 lg:px-10 lg:pb-8 lg:pt-10">
          {isSetup && totalSteps > 1 && (
            <div className="mb-6 hidden items-center gap-2 lg:flex">
              {STEPS.map((item) => (
                <div key={item.id} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition',
                      item.id <= step ? 'bg-sky-500' : 'bg-slate-200',
                    )}
                  />
                </div>
              ))}
              <span className="ml-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-600">
                Step {step}/{totalSteps}
              </span>
            </div>
          )}

          <div className="mb-6 flex items-start gap-3">
            {backTo && (
              <Link
                to={backTo}
                className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
                aria-label="Go back"
              >
                <ArrowLeft size={18} weight="bold" />
              </Link>
            )}
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-600">
                {eyebrow ?? (isSetup ? 'Let us set things up' : 'Update your plan')}
              </p>
              <h1 className="text-balance text-[26px] font-extrabold leading-tight tracking-[-0.04em] text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="animate-fade-up rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-32px_rgba(2,132,199,0.35)] backdrop-blur-xl sm:p-7">
            {children}
          </div>
        </div>

        {footer && (
          <div className="sticky bottom-0 z-20 border-t border-slate-100 bg-canvas/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:px-6 lg:static lg:border-0 lg:bg-transparent lg:px-10 lg:pb-10 lg:backdrop-blur-none">
            <div className="mx-auto w-full max-w-xl">{footer}</div>
          </div>
        )}
      </main>
    </div>
  )
}
