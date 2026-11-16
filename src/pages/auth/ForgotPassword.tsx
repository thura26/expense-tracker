import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, EnvelopeSimple } from '@phosphor-icons/react'
import { AuthShell } from '@/layouts/AuthShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SecureArt } from '@/components/art/Illustrations'
import { useToast } from '@/contexts/ToastContext'
import { friendlyAuthError } from '@/lib/authErrors'
import { authRedirectUrl, supabase } from '@/lib/supabase'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: authRedirectUrl('/reset-password') },
    )

    if (resetError) {
      const message = friendlyAuthError(resetError)
      setError(message)
      toast(message, 'error')
      setLoading(false)
      return
    }

    setSent(true)
    toast('Password reset link sent. Check your inbox.', 'success')
    setLoading(false)
  }

  return (
    <AuthShell
      title={sent ? 'Check your inbox' : 'Forgot password?'}
      subtitle={
        sent
          ? 'We sent a secure reset link to your email. It expires soon, so use it while it is fresh.'
          : 'Enter the email linked to your account and we will send a reset link.'
      }
      art={<SecureArt className="w-full" />}
      panelTitle="A locked door should still have a key."
      panelSubtitle="Reset links are single-use and expire quickly. We never reveal whether an email exists."
      footer={
        <p className="text-center text-[13px] text-slate-500">
          <Link
            to="/signin"
            className="inline-flex items-center gap-1.5 font-extrabold text-sky-600 transition hover:text-sky-700"
          >
            <ArrowLeft size={14} weight="bold" />
            Back to sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="rounded-[24px] bg-emerald-50 p-5 text-center">
          <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-white text-emerald-500 shadow-sm">
            <CheckCircle size={30} weight="duotone" />
          </span>
          <p className="text-sm font-extrabold text-emerald-800">
            Reset link sent
          </p>
          <p className="mt-1.5 break-words text-[12px] leading-relaxed text-emerald-700">
            If an account exists for <span className="font-bold">{email}</span>, a
            reset link is on its way. Check spam if it does not arrive in a minute.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
            className="mt-4 text-[12px] font-extrabold text-emerald-800 underline decoration-emerald-300 underline-offset-4"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            icon={<EnvelopeSimple size={18} />}
            error={error ?? undefined}
          />
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            rightIcon={<ArrowRight size={17} weight="bold" />}
          >
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
