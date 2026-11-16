import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  isDemoMode,
  loadDemoProfile,
  saveDemoProfile,
} from '@/lib/demo'
import { DEFAULT_ALLOCATIONS } from '@/lib/constants'
import { safeNumber } from '@/lib/format'
import type {
  BudgetAllocations,
  BudgetGroupId,
  CurrencyCode,
  ProfileRow,
  UserProfile,
} from '@/types'
import { useAuth } from './AuthContext'

export interface ProfilePatch {
  displayName?: string
  phone?: string
  currency?: CurrencyCode
  monthlyIncome?: number
  incomeSource?: string
  budgetTotal?: number
  budgetAllocations?: BudgetAllocations
  setupComplete?: boolean
}

interface ProfileContextValue {
  profile: UserProfile | null
  loading: boolean
  saving: boolean
  error: string | null
  reload: () => Promise<void>
  saveProfile: (patch: ProfilePatch) => Promise<UserProfile | null>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

function normalizeAllocations(
  allocations: ProfileRow['budget_allocations'],
): BudgetAllocations {
  const next = { ...DEFAULT_ALLOCATIONS }
  if (!allocations) return next
  for (const key of Object.keys(next) as BudgetGroupId[]) {
    const value = Number(allocations[key])
    if (Number.isFinite(value)) next[key] = value
  }
  return next
}

function fromRow(row: ProfileRow): UserProfile {
  return {
    uid: row.id,
    displayName: row.display_name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    currency: (row.currency as CurrencyCode | null) ?? 'MMK',
    monthlyIncome: safeNumber(row.monthly_income),
    incomeSource: row.income_source ?? '',
    budget: {
      total: safeNumber(row.budget_total),
      allocations: normalizeAllocations(row.budget_allocations),
    },
    setupComplete: Boolean(row.setup_complete),
    createdAt: row.created_at,
  }
}

function fallbackProfile(
  uid: string,
  email: string | null,
  displayName: string | null,
  phone: string | null,
): UserProfile {
  return {
    uid,
    displayName: displayName ?? '',
    email: email ?? '',
    phone: phone ?? '',
    currency: 'MMK',
    monthlyIncome: 0,
    incomeSource: '',
    budget: { total: 0, allocations: { ...DEFAULT_ALLOCATIONS } },
    setupComplete: false,
    createdAt: null,
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadedUid, setLoadedUid] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      setLoadedUid(null)
      return
    }
    if (isDemoMode) {
      setProfile(loadDemoProfile())
      setLoadedUid(user.uid)
      setLoading(false)
      return
    }
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let { data, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.uid)
        .maybeSingle<ProfileRow>()

      if (selectError) throw selectError

      if (!data) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.uid,
          email: user.email,
          display_name: user.displayName,
          phone: user.phone,
        })
        if (insertError && insertError.code !== '23505') throw insertError

        const retry = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.uid)
          .maybeSingle<ProfileRow>()
        if (retry.error) throw retry.error
        data = retry.data
      }

      setProfile(
        data
          ? fromRow(data)
          : fallbackProfile(user.uid, user.email, user.displayName, user.phone),
      )
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load your profile.',
      )
      setProfile(
        fallbackProfile(user.uid, user.email, user.displayName, user.phone),
      )
    } finally {
      setLoadedUid(user.uid)
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void loadProfile()
  }, [authLoading, loadProfile])

  const saveProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!user) return null
      if (isDemoMode) {
        setSaving(true)
        setError(null)
        try {
          const base = profile ?? loadDemoProfile()
          const { budgetTotal, budgetAllocations, ...rest } = patch
          const next: UserProfile = {
            ...base,
            ...rest,
            budget: {
              total: budgetTotal ?? base.budget.total,
              allocations: budgetAllocations ?? base.budget.allocations,
            },
          }
          saveDemoProfile(next)
          setProfile(next)
          return next
        } finally {
          setSaving(false)
        }
      }
      setSaving(true)
      setError(null)
      try {
        const row: Record<string, unknown> = {}
        if (patch.displayName !== undefined) row.display_name = patch.displayName
        if (patch.phone !== undefined) row.phone = patch.phone
        if (patch.currency !== undefined) row.currency = patch.currency
        if (patch.monthlyIncome !== undefined) row.monthly_income = patch.monthlyIncome
        if (patch.incomeSource !== undefined) row.income_source = patch.incomeSource
        if (patch.budgetTotal !== undefined) row.budget_total = patch.budgetTotal
        if (patch.budgetAllocations !== undefined) {
          row.budget_allocations = patch.budgetAllocations
        }
        if (patch.setupComplete !== undefined) {
          row.setup_complete = patch.setupComplete
        }

        const { data, error: updateError } = await supabase
          .from('profiles')
          .update(row)
          .eq('id', user.uid)
          .select('*')
          .maybeSingle<ProfileRow>()

        if (updateError) throw updateError

        const next = data
          ? fromRow(data)
          : ({
              ...(profile ??
                fallbackProfile(
                  user.uid,
                  user.email,
                  user.displayName,
                  user.phone,
                )),
              ...patch,
              budget: patch.budgetAllocations
                ? {
                    total: patch.budgetTotal ?? profile?.budget.total ?? 0,
                    allocations: patch.budgetAllocations,
                  }
                : (profile?.budget ?? {
                    total: 0,
                    allocations: { ...DEFAULT_ALLOCATIONS },
                  }),
            } satisfies UserProfile)

        setProfile(next)
        return next
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : 'Could not save your profile.',
        )
        throw saveError
      } finally {
        setSaving(false)
      }
    },
    [user, profile],
  )

  const effectiveLoading =
    loading || (Boolean(user) && loadedUid !== user?.uid)

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading: effectiveLoading,
      saving,
      error,
      reload: loadProfile,
      saveProfile,
    }),
    [profile, effectiveLoading, saving, error, loadProfile, saveProfile],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used inside ProfileProvider')
  return context
}
