import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, EnvelopeSimple, ShieldCheck } from '@phosphor-icons/react'
import { AuthShell } from '@/layouts/AuthShell'
import { Button } from '@/components/ui/Button'
import { ReceiptArt } from '@/components/art/Illustrations'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'
import { friendlyAuthError } from '@/lib/authErrors'
import { PENDING_EMAIL_KEY } from '@/lib/constants'
import { authRedirectUrl, supabase } from '@/lib/supabase'

const LENGTH = 6

export function VerifyOtp() {
  const [params] = useSearchParams()
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [seconds, setSeconds] = useState(60)
  const [error, setError] = useState<string | null>(null)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const navigate = useNavigate()
  const toast = useToast()
  const { profile } = useProfile()

  const email = (params.get('email') ?? sessionStorage.getItem(PENDING_EMAIL_KEY) ?? '').trim()
  const code = digits.join('')
  const complete = code.length === LENGTH

  useEffect(() => {
    if (seconds <= 0) return
    const timer = window.setInterval(() => {
      setSeconds((current) => (current <= 1 ? 0 : current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [seconds])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  function updateDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      setDigits((current) => {
        const next = [...current]
        next[index] = ''
        return next
      })
      return
    }

    if (clean.length > 1) {
      distribute(clean, index)
      return
    }

    setDigits((current) => {
      const next = [...current]
      next[index] = clean
      return next
    })
    setError(null)
    if (index < LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  function distribute(text: string, start = 0) {
    const chars = text.replace(/\D/g, '').slice(0, LENGTH).split('')
    if (chars.length === 0) return
    setDigits((current) => {
      const next = [...current]
      chars.forEach((char, offset) => {
        const target = start + offset
        if (target < LENGTH) next[target] = char
      })
      return next
    })
    setError(null)
    const nextFocus = Math.min(LENGTH - 1, start + chars.length)
    inputs.current[nextFocus]?.focus()
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      setDigits((current) => {
        const next = [...current]
        next[index - 1] = ''
        return next
      })
      inputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const text = event.clipboardData.getData('text')
    if (/\d/.test(text)) {
      event.preventDefault()
      distribute(text)
    }
  }

  async function verify() {
    if (!email) {
      setError('We lost track of your email. Please sign up or sign in again.')
      return
    }
    if (!complete) {
      setError('Enter all 6 digits from your email.')
      return
    }

    setLoading(true)
    setError(null)
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })

    if (verifyError) {
      const message = friendlyAuthError(verifyError)
      setError(message)
      toast(message, 'error')
      setLoading(false)
      return
    }

    sessionStorage.removeItem(PENDING_EMAIL_KEY)
    toast('Email verified. Welcome aboard!', 'success')
    navigate(profile?.setupComplete ? '/home' : '/setup/currency', { replace: true })
  }

  async function resend() {
    if (!email || seconds > 0) return
    setResending(true)
    setError(null)
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: authRedirectUrl('/auth/callback') },
    })
    if (resendError) {
      const message = friendlyAuthError(resendError)
      setError(message)
      toast(message, 'error')
    } else {
      setSeconds(60)
      toast('A fresh code is on its way.', 'success')
    }
    setResending(false)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await verify()
  }

  if (!email) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="We need your email address to check the code."
        art={<ReceiptArt className="w-full" />}
        footer={
          <p className="text-center text-[13px] text-slate-500">
            <Link to="/signup" className="font-extrabold text-sky-600">
              Create an account
            </Link>{' '}
            or{' '}
            <Link to="/signin" className="font-extrabold text-sky-600">
              sign in
            </Link>
          </p>
        }
      >
        <div className="rounded-2xl bg-amber-50 p-4 text-[13px] font-semibold leading-relaxed text-amber-800">
          No pending email was found. Start from sign up so we can send a fresh
          verification code.
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="OTP verification"
      subtitle={`Enter the 6-digit code we sent to ${email}.`}
      art={<ReceiptArt className="w-full" />}
      panelTitle="One code, then you are in."
      panelSubtitle="Email verification keeps your expense history private, even if someone knows your password."
      footer={
        <p className="text-center text-[13px] text-slate-500">
          Wrong email?{' '}
          <Link
            to="/signup"
            className="font-extrabold text-sky-600 transition hover:text-sky-700"
          >
            Change email address
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-[12px] font-semibold text-sky-800">
          <EnvelopeSimple size={18} weight="duotone" className="shrink-0" />
          <span className="min-w-0 truncate">{email}</span>
          <ShieldCheck size={18} weight="duotone" className="ml-auto shrink-0 text-sky-500" />
        </div>

        <div
          className="grid grid-cols-6 gap-1.5 sm:gap-2"
          onPaste={handlePaste}
          role="group"
          aria-label="Six digit verification code"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element
              }}
              value={digit}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${index + 1}`}
              className="h-13 w-full rounded-2xl border border-slate-200 bg-white text-center text-xl font-extrabold text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 sm:h-14 sm:text-2xl"
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-[12px] font-semibold leading-relaxed text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[12px] text-slate-500">
            {seconds > 0 ? (
              <>
                Resend code in{' '}
                <span className="font-extrabold text-slate-700">
                  {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                  {String(seconds % 60).padStart(2, '0')}
                </span>
              </>
            ) : (
              'Did not get the code?'
            )}
          </p>
          <button
            type="button"
            onClick={() => void resend()}
            disabled={seconds > 0 || resending}
            className="text-[12px] font-extrabold text-sky-600 transition hover:text-sky-700 disabled:text-slate-300"
          >
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-5"
          loading={loading}
          disabled={!complete}
          rightIcon={<ArrowRight size={17} weight="bold" />}
        >
          Verify email
        </Button>
      </form>
    </AuthShell>
  )
}
