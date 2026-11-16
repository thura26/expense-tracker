import { createClient, type SupportedStorage, type User as SupabaseUser } from '@supabase/supabase-js'
import { REMEMBER_KEY } from './constants'
import type { AppUser } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Supabase now issues publishable keys (sb_publishable_…) alongside the legacy
// anon keys. Accept either name so existing and new projects both work.
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const fallbackStorage: SupportedStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

function currentStorage() {
  if (typeof window === 'undefined') return fallbackStorage
  return localStorage.getItem(REMEMBER_KEY) === '0' ? sessionStorage : localStorage
}

const rememberAwareStorage: SupportedStorage = {
  getItem: (key) => currentStorage().getItem(key),
  setItem: (key, value) => currentStorage().setItem(key, value),
  removeItem: (key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export function setRememberMe(remember: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
  // Move the next session into the chosen storage instead of keeping a stale
  // copy in the other one.
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        storage.removeItem(key)
      }
    }
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: rememberAwareStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  },
)

export function toAppUser(user: SupabaseUser | null | undefined): AppUser | null {
  if (!user) return null
  const metadata = user.user_metadata ?? {}
  const displayName =
    (metadata.full_name as string | undefined) ??
    (metadata.name as string | undefined) ??
    null
  const photoURL =
    (metadata.avatar_url as string | undefined) ??
    (metadata.picture as string | undefined) ??
    null
  return {
    uid: user.id,
    email: user.email ?? null,
    displayName,
    photoURL,
    phone: (metadata.phone as string | undefined) ?? user.phone ?? null,
  }
}

export function authRedirectUrl(path = '/auth/callback') {
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}
