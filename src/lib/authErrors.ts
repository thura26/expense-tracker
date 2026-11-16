export function friendlyAuthError(error: unknown) {
  const message =
    typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : error instanceof Error
        ? error.message
        : ''
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : ''

  const normalized = `${code} ${message}`.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Email or password is incorrect.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please verify your email before signing in.'
  }
  if (normalized.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in.'
  }
  if (normalized.includes('password should be at least')) {
    return 'Use at least 6 characters for your password.'
  }
  if (normalized.includes('new password should be different')) {
    return 'Choose a password you have not used before.'
  }
  if (
    normalized.includes('email rate limit') ||
    normalized.includes('over_email_send_rate_limit')
  ) {
    return 'Too many emails requested. Please wait a moment and try again.'
  }
  if (normalized.includes('for security purposes')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (normalized.includes('unable to validate email')) {
    return 'That email address looks invalid.'
  }
  if (normalized.includes('signup requires a valid password')) {
    return 'Please enter a password.'
  }
  if (normalized.includes('token has expired') || normalized.includes('otp expired')) {
    return 'That code has expired. Request a new one.'
  }
  if (normalized.includes('invalid token') || normalized.includes('invalid otp')) {
    return 'That code is not correct. Please try again.'
  }
  if (
    normalized.includes('row-level security') ||
    normalized.includes('permission denied') ||
    normalized.includes('42501')
  ) {
    return 'You do not have permission to do that. Check your Supabase RLS policies.'
  }
  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'Network error. Check your connection and try again.'
  }
  if (normalized.includes('bucket not found')) {
    return 'Receipt storage is not set up yet. Create the "receipts" bucket in Supabase.'
  }
  if (normalized.includes('jwt') || normalized.includes('session')) {
    return 'Your session expired. Please sign in again.'
  }

  if (message && message.length < 180) {
    return message.replace(/^Firebase:\s*/i, '').trim()
  }
  return 'Something went wrong. Please try again.'
}
