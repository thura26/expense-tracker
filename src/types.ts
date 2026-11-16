export type CurrencyCode =
  | 'MMK'
  | 'USD'
  | 'EUR'
  | 'THB'
  | 'SGD'
  | 'EGP'
  | 'SAR'
  | 'GBP'
  | 'JPY'
  | 'MYR'
  | 'CNY'
  | 'INR'
  | 'AUD'
  | 'CAD'

export type CategoryId =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'bills'
  | 'gifts'
  | 'other'

export type IncomeSourceId =
  | 'salary'
  | 'freelance'
  | 'business'
  | 'investment'
  | 'gift'
  | 'other'

export type BudgetGroupId = 'food' | 'transport' | 'shopping' | 'bills' | 'other'

export type BillFrequency = 'once' | 'monthly' | 'weekly'

export type ToastType = 'success' | 'error' | 'info'

export type BudgetAllocations = Record<BudgetGroupId, number>

export interface Budget {
  total: number
  allocations: BudgetAllocations
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  phone?: string
  currency: CurrencyCode
  monthlyIncome: number
  incomeSource?: string
  budget: Budget
  setupComplete: boolean
  createdAt?: string | null
}

export interface Expense {
  id: string
  amount: number
  category: CategoryId
  date: string
  paymentMethod: string
  note?: string
  receiptPath?: string | null
  createdAt?: string | null
}

export interface Income {
  id: string
  amount: number
  source: IncomeSourceId
  date: string
  note?: string
  createdAt?: string | null
}

export interface Bill {
  id: string
  title: string
  amount: number
  dueDate: string
  frequency: BillFrequency
  category: CategoryId
  active: boolean
  lastPaidAt?: string | null
  createdAt?: string | null
}

export interface AppUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  phone: string | null
}

export interface CategoryMeta {
  id: CategoryId
  label: string
  color: string
  soft: string
}

export interface IncomeSourceMeta {
  id: IncomeSourceId
  label: string
  color: string
  soft: string
}

export interface CurrencyMeta {
  code: CurrencyCode
  label: string
  country: string
  flag: string
  decimals: number
  quickAmounts: number[]
  primary?: boolean
}

export interface NewExpense {
  amount: number
  category: CategoryId
  date: string
  paymentMethod: string
  note?: string
  receiptFile?: File | null
}

export interface NewIncome {
  amount: number
  source: IncomeSourceId
  date: string
  note?: string
}

export interface NewBill {
  title: string
  amount: number
  dueDate: string
  frequency: BillFrequency
  category: CategoryId
}

export interface ProfileRow {
  id: string
  display_name: string | null
  email: string | null
  phone: string | null
  currency: string | null
  monthly_income: number | string | null
  income_source: string | null
  budget_total: number | string | null
  budget_allocations: Partial<Record<BudgetGroupId, number>> | null
  setup_complete: boolean | null
  created_at: string | null
}

export interface ExpenseRow {
  id: string
  user_id: string
  amount: number | string
  category: string
  date: string
  payment_method: string
  note: string | null
  receipt_path: string | null
  created_at: string | null
}

export interface IncomeRow {
  id: string
  user_id: string
  amount: number | string
  source: string
  date: string
  note: string | null
  created_at: string | null
}

export interface BillRow {
  id: string
  user_id: string
  title: string
  amount: number | string
  due_date: string
  frequency: string
  category: string
  active: boolean
  last_paid_at: string | null
  created_at: string | null
}
