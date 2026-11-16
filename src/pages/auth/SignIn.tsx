import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AppleLogo,
  ArrowRight,
  EnvelopeSimple,
  FacebookLogo,
  LockKey,
} from '@phosphor-icons/react'
import { AuthShell } from '@/layouts/AuthShell'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Input'
import { GoogleIcon } from '@/components/ui/GoogleIcon'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { friendlyAuthError } from '@/lib/authErrors'
import {
  PENDING_EMAIL_KEY,
  REMEMBER_KEY,
} from '@/lib/constants'
import { authRedirectUrl, setRememberMe, supabase } from '@/lib/supabase'

export function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(
    () => localStorage.getItem(REMEMBER_KEY) !== '0',
  )
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerify, setNeedsVerify] = useState(false)
  const { refresh } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNeedsVerify(false)

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    setLoading(true)
    setRememberMe(remember)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      const message = friendlyAuthError(signInError)
      setError(message)
      if (/verify your email/i.test(message)) {
        setNeedsVerify(true)
        sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim())
      }
      toast(message, 'error')
      setLoading(false)
      return
    }

    await refresh()
    toast('Welcome back!', 'success')
    navigate('/home', { replace: true })
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authRedirectUrl('/auth/callback'),
        queryParams: { prompt: 'select_account' },
      },
    })
    if (oauthError) {
      const message = friendlyAuthError(oauthError)
      setError(message)
      toast(message, 'error')
      setGoogleLoading(false)
    }
  }

  function comingSoon(provider: string) {
    toast(`${provider} sign-in is coming soon. Use Google or email for now.`, 'info')
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue tracking your money."
      footer={
        <p className="text-center text-[13px] text-slate-500">
          New to MoneyTrack?{' '}
          <Link
            to="/signup"
            className="font-extrabold text-sky-600 transition hover:text-sky-700"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<EnvelopeSimple size={18} />}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<LockKey size={18} />}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 rounded border-slate-300 accent-sky-600"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-[12px] font-extrabold text-sky-600 transition hover:text-sky-700"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-[12px] font-semibold leading-relaxed text-rose-700">
            {error}
            {needsVerify && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`)
                }
                className="mt-2 block font-extrabold text-rose-800 underline decoration-rose-300 underline-offset-4"
              >
                Verify my email instead
              </button>
            )}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          rightIcon={<ArrowRight size={17} weight="bold" />}
        >
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
          or continue with
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white text-[11px] font-extrabold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 disabled:opacity-60"
        >
          <GoogleIcon size={17} />
          Google
        </button>
        <button
          type="button"
          onClick={() => comingSoon('Apple')}
          className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white text-[11px] font-extrabold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
        >
          <AppleLogo size={18} weight="fill" />
          Apple
        </button>
        <button
          type="button"
          onClick={() => comingSoon('Facebook')}
          className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white text-[11px] font-extrabold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
        >
          <FacebookLogo size={18} weight="fill" />
          Facebook
        </button>
      </div>
    </AuthShell>
  )
}
