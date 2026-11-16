import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKey, WarningCircle } from '@phosphor-icons/react'
import { AuthShell } from '@/layouts/AuthShell'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/Input'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { SecureArt } from '@/components/art/Illustrations'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'
import { friendlyAuthError } from '@/lib/authErrors'
import { supabase } from '@/lib/supabase'

export function ResetPassword() {
  const { user, loading } = useAuth()
  const { profile } = useProfile()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const toast = useToast()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Use at least 6 characters for your new password.')
      return
    }
    if (password !== confirm) {
      setError('Those passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      const message = friendlyAuthError(updateError)
      setError(message)
      toast(message, 'error')
      setSubmitting(false)
      return
    }

    toast('Password updated. You are signed in.', 'success')
    navigate(profile?.setupComplete ? '/home' : '/setup/currency', { replace: true })
  }

  if (loading) return <FullScreenLoader label="Checking your reset link…" />

  if (!user) {
    return (
      <AuthShell
        title="This reset link is not active"
        subtitle="Reset links can only be used once, and they expire quickly."
        art={<SecureArt className="w-full" />}
        footer={
          <p className="text-center text-[13px] text-slate-500">
            <Link to="/signin" className="font-extrabold text-sky-600">
              Back to sign in
            </Link>
          </p>
        }
      >
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
          <WarningCircle size={22} weight="duotone" className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-[13px] font-semibold leading-relaxed text-amber-800">
            Request a fresh reset link and open it on this device. If you already
            reset your password, simply sign in.
          </p>
        </div>
        <Button
          fullWidth
          size="lg"
          className="mt-5"
          onClick={() => navigate('/forgot-password')}
          rightIcon={<ArrowRight size={17} weight="bold" />}
        >
          Request a new link
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle={`Reset the password for ${user.email ?? 'your account'}.`}
      art={<SecureArt className="w-full" />}
      panelTitle="Fresh password, same safe space."
      panelSubtitle="Pick something long enough to be strong, and different from your last one."
      footer={
        <p className="text-center text-[13px] text-slate-500">
          Remembered it?{' '}
          <Link to="/signin" className="font-extrabold text-sky-600">
            Sign in instead
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<LockKey size={18} />}
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Type it once more"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
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
          loading={submitting}
          rightIcon={<ArrowRight size={17} weight="bold" />}
        >
          Update password
        </Button>
      </form>
    </AuthShell>
  )
}
