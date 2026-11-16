import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase, toAppUser } from '@/lib/supabase'
import { demoSession, exitDemoMode, isDemoMode } from '@/lib/demo'
import type { AppUser } from '@/types'

interface AuthContextValue {
  user: AppUser | null
  session: Session | null
  loading: boolean
  configured: boolean
  demo: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    isDemoMode ? demoSession() : null,
  )
  const [loading, setLoading] = useState(isSupabaseConfigured && !isDemoMode)

  const refresh = useCallback(async () => {
    if (isDemoMode) {
      setSession(demoSession())
      setLoading(false)
      return
    }
    if (!isSupabaseConfigured) return
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isDemoMode || !isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
        setLoading(false)
      })
      .catch(() => {
        if (active) setLoading(false)
      })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
        setLoading(false)
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setSession(null)
      exitDemoMode()
      return
    }
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  const user = useMemo(() => toAppUser(session?.user), [session])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      configured: isSupabaseConfigured,
      demo: isDemoMode,
      refresh,
      signOut,
    }),
    [user, session, loading, refresh, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
