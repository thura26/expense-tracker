import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { WarningCircle } from '@phosphor-icons/react'
import { Logo } from '@/components/ui/Logo'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'

export function AuthCallback() {
  const [params] = useSearchParams()
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const [failed, setFailed] = useState<string | null>(null)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const errorDescription = params.get('error_description') ?? params.get('error')
    if (errorDescription) setFailed(errorDescription)
    // supabase-js detects the PKCE `code` in the URL and exchanges it
    // automatically. The auth listener then updates the session.
  }, [params])

  useEffect(() => {
    if (loading) return
    if (user) {
      if (profileLoading) return
      setFailed(null)
      navigate(profile?.setupComplete ? '/home' : '/setup/currency', {
        replace: true,
      })
      return
    }
    if (failed) return
    const timer = window.setTimeout(() => {
      setFailed('We could not complete the sign-in. Please try again.')
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [failed, loading, user, profile, profileLoading, navigate])

  useEffect(() => {
    if (failed) toast(failed, 'error')
  }, [failed, toast])

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white/90 p-8 text-center shadow-[0_30px_80px_-40px_rgba(2,132,199,0.45)] backdrop-blur-xl">
        <Logo className="justify-center" />
        {failed ? (
          <>
            <span className="mx-auto mt-6 grid size-14 place-items-center rounded-full bg-rose-50 text-rose-500">
              <WarningCircle size={30} weight="duotone" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">
              Sign-in did not finish
            </h1>
            <p className="mt-2 break-words text-[13px] leading-relaxed text-slate-500">
              {failed}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                to="/signin"
                className="inline-flex h-11 items-center justify-center rounded-full bg-sky-600 text-sm font-extrabold text-white transition hover:bg-sky-700"
              >
                Try signing in again
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
              >
                Create an account
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mt-7 grid size-16 place-items-center rounded-full bg-sky-50">
              <Spinner size={28} />
            </div>
            <h1 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">
              Finishing sign-in
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
              Connecting your Google account to MoneyTrack…
            </p>
          </>
        )}
      </div>
    </div>
  )
}
