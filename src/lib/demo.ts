import type { Session } from '@supabase/supabase-js'
import { addDays, format, startOfMonth, subDays, subMonths } from 'date-fns'
import { isSupabaseConfigured } from './supabase'
import { DEFAULT_ALLOCATIONS } from './constants'
import type { Bill, Expense, Income, UserProfile } from '@/types'

const DEMO_KEY = 'moneytrack.demo'
const PROFILE_KEY = 'moneytrack.demo.profile'
const EXPENSES_KEY = 'moneytrack.demo.expenses'
const INCOMES_KEY = 'moneytrack.demo.incomes'
const BILLS_KEY = 'moneytrack.demo.bills'

export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001'

export const isDemoMode =
  (import.meta.env.DEV || !isSupabaseConfigured) &&
  typeof window !== 'undefined' &&
  localStorage.getItem(DEMO_KEY) === '1'

export function enterDemoMode() {
  localStorage.setItem(DEMO_KEY, '1')
  window.location.assign('/')
}

export function exitDemoMode() {
  localStorage.removeItem(DEMO_KEY)
  window.location.assign('/')
}

export function demoSession(): Session {
  return {
    access_token: 'demo-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'demo-refresh-token',
    user: {
      id: DEMO_USER_ID,
      email: 'demo@moneytrack.app',
      phone: '+95 9 123 456 789',
      user_metadata: {
        full_name: 'Thura Aung',
        phone: '+95 9 123 456 789',
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: subDays(new Date(), 120).toISOString(),
    },
  } as unknown as Session
}

const defaultProfile = (): UserProfile => ({
  uid: DEMO_USER_ID,
  displayName: 'Thura Aung',
  email: 'demo@moneytrack.app',
  phone: '+95 9 123 456 789',
  currency: 'MMK',
  monthlyIncome: 1_800_000,
  incomeSource: 'Salary',
  budget: {
    total: 1_200_000,
    allocations: { ...DEFAULT_ALLOCATIONS },
  },
  setupComplete: true,
  createdAt: subDays(new Date(), 120).toISOString(),
})

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function dateDaysAgo(days: number) {
  return format(subDays(new Date(), days), 'yyyy-MM-dd')
}

function monthDay(monthsAgo: number, day: number) {
  const date = startOfMonth(subMonths(new Date(), monthsAgo))
  date.setDate(day)
  return format(date, 'yyyy-MM-dd')
}

function seedExpenses(): Expense[] {
  return [
    {
      id: 'demo-exp-1',
      amount: 25000,
      category: 'food',
      date: dateDaysAgo(0),
      paymentMethod: 'KBZPay',
      note: 'Lunch with the team',
    },
    {
      id: 'demo-exp-2',
      amount: 8000,
      category: 'transport',
      date: dateDaysAgo(1),
      paymentMethod: 'Cash',
      note: 'Taxi home',
    },
    {
      id: 'demo-exp-3',
      amount: 120000,
      category: 'shopping',
      date: dateDaysAgo(2),
      paymentMethod: 'Visa Card',
      note: 'Running shoes',
    },
    {
      id: 'demo-exp-4',
      amount: 180000,
      category: 'bills',
      date: dateDaysAgo(3),
      paymentMethod: 'Bank Transfer',
      note: 'Electricity bill',
    },
    {
      id: 'demo-exp-5',
      amount: 35000,
      category: 'entertainment',
      date: dateDaysAgo(5),
      paymentMethod: 'WavePay',
      note: 'Cinema and snacks',
    },
    {
      id: 'demo-exp-6',
      amount: 15000,
      category: 'food',
      date: dateDaysAgo(7),
      paymentMethod: 'Cash',
      note: 'Morning coffee beans',
    },
    {
      id: 'demo-exp-7',
      amount: 45000,
      category: 'health',
      date: dateDaysAgo(9),
      paymentMethod: 'KBZPay',
      note: 'Pharmacy',
    },
    {
      id: 'demo-exp-8',
      amount: 60000,
      category: 'education',
      date: dateDaysAgo(11),
      paymentMethod: 'Bank Transfer',
      note: 'Online course',
    },
    {
      id: 'demo-exp-9',
      amount: 20000,
      category: 'gifts',
      date: dateDaysAgo(13),
      paymentMethod: 'Cash',
      note: 'Birthday gift',
    },
    {
      id: 'demo-exp-10',
      amount: 95000,
      category: 'shopping',
      date: monthDay(1, 18),
      paymentMethod: 'Visa Card',
      note: 'Household things',
    },
    {
      id: 'demo-exp-11',
      amount: 420000,
      category: 'bills',
      date: monthDay(1, 5),
      paymentMethod: 'Bank Transfer',
      note: 'Rent',
    },
    {
      id: 'demo-exp-12',
      amount: 68000,
      category: 'food',
      date: monthDay(1, 12),
      paymentMethod: 'KBZPay',
      note: 'Groceries',
    },
    {
      id: 'demo-exp-13',
      amount: 310000,
      category: 'bills',
      date: monthDay(2, 5),
      paymentMethod: 'Bank Transfer',
      note: 'Rent',
    },
    {
      id: 'demo-exp-14',
      amount: 155000,
      category: 'shopping',
      date: monthDay(2, 16),
      paymentMethod: 'Visa Card',
      note: 'Weekend shopping',
    },
    {
      id: 'demo-exp-15',
      amount: 72000,
      category: 'transport',
      date: monthDay(3, 8),
      paymentMethod: 'Cash',
      note: 'Fuel',
    },
  ]
}

function seedIncomes(): Income[] {
  return [
    {
      id: 'demo-inc-1',
      amount: 1_800_000,
      source: 'salary',
      date: monthDay(0, 1),
      note: 'Monthly salary',
      createdAt: subDays(new Date(), 15).toISOString(),
    },
    {
      id: 'demo-inc-2',
      amount: 250_000,
      source: 'freelance',
      date: dateDaysAgo(6),
      note: 'Website project',
      createdAt: subDays(new Date(), 6).toISOString(),
    },
    {
      id: 'demo-inc-3',
      amount: 1_750_000,
      source: 'salary',
      date: monthDay(1, 1),
      note: 'Monthly salary',
      createdAt: subMonths(new Date(), 1).toISOString(),
    },
    {
      id: 'demo-inc-4',
      amount: 180_000,
      source: 'freelance',
      date: monthDay(1, 15),
      note: 'Logo design',
      createdAt: subMonths(new Date(), 1).toISOString(),
    },
    {
      id: 'demo-inc-5',
      amount: 1_700_000,
      source: 'salary',
      date: monthDay(2, 1),
      note: 'Monthly salary',
      createdAt: subMonths(new Date(), 2).toISOString(),
    },
    {
      id: 'demo-inc-6',
      amount: 1_650_000,
      source: 'salary',
      date: monthDay(3, 1),
      note: 'Monthly salary',
      createdAt: subMonths(new Date(), 3).toISOString(),
    },
    {
      id: 'demo-inc-7',
      amount: 1_600_000,
      source: 'salary',
      date: monthDay(4, 1),
      note: 'Monthly salary',
      createdAt: subMonths(new Date(), 4).toISOString(),
    },
    {
      id: 'demo-inc-8',
      amount: 1_550_000,
      source: 'salary',
      date: monthDay(5, 1),
      note: 'Monthly salary',
      createdAt: subMonths(new Date(), 5).toISOString(),
    },
  ]
}

function seedBills(): Bill[] {
  return [
    {
      id: 'demo-bill-1',
      title: 'Apartment rent',
      amount: 450000,
      dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      frequency: 'monthly',
      category: 'bills',
      active: true,
      lastPaidAt: null,
    },
    {
      id: 'demo-bill-2',
      title: 'Fiber internet',
      amount: 35000,
      dueDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
      frequency: 'monthly',
      category: 'bills',
      active: true,
      lastPaidAt: null,
    },
    {
      id: 'demo-bill-3',
      title: 'Netflix',
      amount: 12000,
      dueDate: format(addDays(new Date(), 12), 'yyyy-MM-dd'),
      frequency: 'monthly',
      category: 'entertainment',
      active: true,
      lastPaidAt: null,
    },
    {
      id: 'demo-bill-4',
      title: 'Electricity',
      amount: 60000,
      dueDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
      frequency: 'monthly',
      category: 'bills',
      active: true,
      lastPaidAt: null,
    },
    {
      id: 'demo-bill-5',
      title: 'Gym membership',
      amount: 25000,
      dueDate: format(addDays(new Date(), 20), 'yyyy-MM-dd'),
      frequency: 'monthly',
      category: 'health',
      active: true,
      lastPaidAt: null,
    },
    {
      id: 'demo-bill-6',
      title: 'Annual domain',
      amount: 30000,
      dueDate: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
      frequency: 'once',
      category: 'bills',
      active: false,
      lastPaidAt: subDays(new Date(), 10).toISOString(),
    },
  ]
}

export function loadDemoProfile(): UserProfile {
  const stored = readJson<UserProfile | null>(PROFILE_KEY, null)
  if (stored) {
    return {
      ...defaultProfile(),
      ...stored,
      budget: {
        total: stored.budget?.total ?? 0,
        allocations: {
          ...DEFAULT_ALLOCATIONS,
          ...stored.budget?.allocations,
        },
      },
    }
  }
  return defaultProfile()
}

export function saveDemoProfile(profile: UserProfile) {
  writeJson(PROFILE_KEY, profile)
}

export function loadDemoExpenses(): Expense[] {
  return readJson<Expense[]>(EXPENSES_KEY, seedExpenses())
}

export function saveDemoExpenses(expenses: Expense[]) {
  writeJson(EXPENSES_KEY, expenses)
}

export function loadDemoIncomes(): Income[] {
  return readJson<Income[]>(INCOMES_KEY, seedIncomes())
}

export function saveDemoIncomes(incomes: Income[]) {
  writeJson(INCOMES_KEY, incomes)
}

export function loadDemoBills(): Bill[] {
  return readJson<Bill[]>(BILLS_KEY, seedBills())
}

export function saveDemoBills(bills: Bill[]) {
  writeJson(BILLS_KEY, bills)
}
