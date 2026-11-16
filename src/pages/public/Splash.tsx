import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Blobs } from '@/components/ui/Blobs'
import { Logo } from '@/components/ui/Logo'
import { WalletArt } from '@/components/art/Illustrations'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/contexts/ProfileContext'
import { ONBOARDED_KEY } from '@/lib/constants'

export function Splash() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const navigate = useNavigate()
  const [minElapsed, setMinElapsed] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), 1500)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!minElapsed || authLoading) return
    if (user && profileLoading) return

    const onboarded = localStorage.getItem(ONBOARDED_KEY) === '1'

    if (!user) {
      navigate(onboarded ? '/signin' : '/onboarding', { replace: true })
      return
    }

    if (!profile?.setupComplete) {
      navigate('/setup/currency', { replace: true })
      return
    }

    navigate('/home', { replace: true })
  }, [minElapsed, authLoading, user, profile, profileLoading, navigate])

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-10">
      <Blobs />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="animate-fade-in">
          <Logo />
        </div>

        <div className="animate-float my-6 w-full max-w-[320px] sm:max-w-[360px]">
          <WalletArt className="w-full" />
        </div>

        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-sky-600">
          Welcome to MoneyTrack
        </p>
        <h1 className="text-balance text-4xl font-extrabold leading-[1.06] tracking-[-0.05em] text-slate-900 sm:text-5xl">
          Manage Your Money Smarter
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
          Income, expenses, budgets, bills, and gentle insights — all in one calm place.
        </p>

        <div className="mt-9 h-1.5 w-44 overflow-hidden rounded-full bg-sky-100">
          <div className="animate-splash h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-700" />
        </div>
        <p className="mt-3 text-[11px] font-semibold text-slate-400">
          Getting things ready…
        </p>
      </div>
      <p className="absolute bottom-5 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
        MoneyTrack · v1.0
      </p>
    </div>
  )
}
