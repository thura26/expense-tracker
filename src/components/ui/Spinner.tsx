import { CircleNotch } from '@phosphor-icons/react'
import { Logo } from './Logo'

export function Spinner({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <CircleNotch
      size={size}
      weight="bold"
      className={className ?? 'animate-spin-slow text-sky-600'}
    />
  )
}

export function FullScreenLoader({ label = 'Loading your money…' }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="flex flex-col items-center gap-5">
        <Logo />
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Spinner />
          {label}
        </div>
      </div>
    </div>
  )
}
