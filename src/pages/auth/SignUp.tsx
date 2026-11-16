import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AppleLogo,
  ArrowRight,
  EnvelopeSimple,
  FacebookLogo,
  LockKey,
  Phone,
  User,
} from '@phosphor-icons/react'
import { AuthShell } from '@/layouts/AuthShell'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Input'
import { GoogleIcon } from '@/components/ui/GoogleIcon'
import { useToast } from '@/contexts/ToastContext'
import { friendlyAuthError } from '@/lib/authErrors'
import { PENDING_EMAIL_KEY } from '@/lib/constants'
import { authRedirectUrl, supabase } from '@/lib/supabase'

export function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const toast = useToast()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Use at least 6 characters for your password.')
      return
    }

    setLoading(true)
    const trimmedEmail = email.trim()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: authRedirectUrl('/auth/callback'),
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    })

    if (signUpError) {
      const message = friendlyAuthError(signUpError)
      setError(message)
      toast(message, 'error')
      setLoading(false)
      return
    }

    sessionStorage.setItem(PENDING_EMAIL_KEY, trimmedEmail)

    if (data.session) {
      toast('Account created. Let us set up your money!', 'success')
      navigate('/setup/currency', { replace: true })
      return
    }

    toast('Check your email for the 6-digit verification code.', 'success')
    navigate(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`, {
      replace: true,
    })
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
    toast(`${provider} sign-up is coming soon. Use Google or email for now.`, 'info')
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="A calmer way to track spending starts here."
      footer={
        <p className="text-center text-[13px] text-slate-500">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-extrabold text-sky-600 transition hover:text-sky-700"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Thura Aung"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          icon={<User size={18} />}
        />
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<EnvelopeSimple size={18} />}
        />
        <Input
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="+95 9 000 000 000"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          icon={<Phone size={18} />}
          hint="Optional — used only on your profile."
        />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<LockKey size={18} />}
        />

        {error && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-[12px] font-semibold leading-relaxed text-rose-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          rightIcon={<ArrowRight size={17} weight="bold" />}
        >
          Create account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
          or sign up with
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
