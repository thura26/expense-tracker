import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ShieldCheck, Target } from '@phosphor-icons/react'
import { Blobs } from '@/components/ui/Blobs'
import { Logo } from '@/components/ui/Logo'
import { WalletArt } from '@/components/art/Illustrations'

interface AuthShellProps {
  children: ReactNode
  title: string
  subtitle: string
  art?: ReactNode
  panelTitle?: string
  panelSubtitle?: string
  footer?: ReactNode
}

const FEATURES = [
  { icon: ArrowDownLeft, label: 'Income & spending side by side' },
  { icon: Target, label: 'Budgets that stay realistic' },
  { icon: ShieldCheck, label: 'Your data is private by default' },
]

export function AuthShell({
  children,
  title,
  subtitle,
  art,
  panelTitle = 'Manage your money with a calmer rhythm.',
  panelSubtitle = 'Track spending and income, plan monthly budgets, and never miss a bill again.',
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 p-10 text-white lg:flex lg:flex-col xl:p-14">
        <Blobs className="opacity-30 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_45%)]" />

        <div className="relative z-10">
          <Link to="/" aria-label="MoneyTrack home">
            <Logo light />
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-md">
            <div className="animate-float mb-6 w-full max-w-sm">{art ?? <WalletArt className="w-full" />}</div>
            <h2 className="text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] xl:text-4xl">
              {panelTitle}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-sky-100/90">
              {panelSubtitle}
            </p>
            <ul className="mt-7 space-y-2.5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <li
                    key={feature.label}
                    className="flex items-center gap-3 text-[13px] font-semibold text-sky-50/95"
                  >
                    <span className="grid size-8 place-items-center rounded-xl bg-white/15">
                      <Icon size={17} weight="duotone" />
                    </span>
                    {feature.label}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <p className="relative z-10 text-[11px] font-medium text-sky-200/80">
          Built with Supabase · Your data stays yours
        </p>
      </aside>

      <main className="relative flex min-h-dvh flex-col px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" aria-label="MoneyTrack home">
            <Logo />
          </Link>
          <Link
            to="/onboarding"
            className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-sky-600"
          >
            About
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-6 lg:py-10">
          <div className="animate-fade-up w-full max-w-md rounded-[30px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_70px_-32px_rgba(2,132,199,0.4)] backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h1 className="text-balance text-[26px] font-extrabold leading-tight tracking-[-0.04em] text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            </div>
            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          By continuing you agree to keep your account details safe.
        </p>
      </main>
    </div>
  )
}
