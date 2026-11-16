import type {
  BillFrequency,
  BudgetAllocations,
  BudgetGroupId,
  CategoryId,
  CategoryMeta,
  CurrencyCode,
  CurrencyMeta,
  IncomeSourceId,
  IncomeSourceMeta,
} from '@/types'

export const ONBOARDED_KEY = 'moneytrack.onboarded'
export const REMEMBER_KEY = 'moneytrack.remember'
export const PENDING_EMAIL_KEY = 'moneytrack.pendingEmail'

export const CURRENCIES: CurrencyMeta[] = [
  {
    code: 'MMK',
    label: 'Myanmar Kyat',
    country: 'Myanmar',
    flag: '🇲🇲',
    decimals: 0,
    quickAmounts: [100_000, 300_000, 500_000, 1_000_000, 2_000_000],
    primary: true,
  },
  {
    code: 'USD',
    label: 'US Dollar',
    country: 'United States',
    flag: '🇺🇸',
    decimals: 2,
    quickAmounts: [500, 1_000, 2_000, 5_000, 10_000],
    primary: true,
  },
  {
    code: 'EUR',
    label: 'Euro',
    country: 'European Union',
    flag: '🇪🇺',
    decimals: 2,
    quickAmounts: [500, 1_000, 2_000, 5_000, 10_000],
    primary: true,
  },
  {
    code: 'THB',
    label: 'Thai Baht',
    country: 'Thailand',
    flag: '🇹🇭',
    decimals: 2,
    quickAmounts: [5_000, 10_000, 20_000, 50_000, 100_000],
    primary: true,
  },
  {
    code: 'SGD',
    label: 'Singapore Dollar',
    country: 'Singapore',
    flag: '🇸🇬',
    decimals: 2,
    quickAmounts: [500, 1_000, 2_000, 5_000, 10_000],
    primary: true,
  },
  {
    code: 'EGP',
    label: 'Egyptian Pound',
    country: 'Egypt',
    flag: '🇪🇬',
    decimals: 2,
    quickAmounts: [5_000, 10_000, 15_000, 20_000, 30_000],
  },
  {
    code: 'SAR',
    label: 'Saudi Riyal',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    decimals: 2,
    quickAmounts: [5_000, 10_000, 15_000, 20_000, 30_000],
  },
  {
    code: 'GBP',
    label: 'British Pound',
    country: 'United Kingdom',
    flag: '🇬🇧',
    decimals: 2,
    quickAmounts: [500, 1_000, 2_000, 5_000, 10_000],
  },
  {
    code: 'JPY',
    label: 'Japanese Yen',
    country: 'Japan',
    flag: '🇯🇵',
    decimals: 0,
    quickAmounts: [50_000, 100_000, 200_000, 500_000, 1_000_000],
  },
  {
    code: 'MYR',
    label: 'Malaysian Ringgit',
    country: 'Malaysia',
    flag: '🇲🇾',
    decimals: 2,
    quickAmounts: [500, 1_000, 2_000, 5_000, 10_000],
  },
  {
    code: 'CNY',
    label: 'Chinese Yuan',
    country: 'China',
    flag: '🇨🇳',
    decimals: 2,
    quickAmounts: [500, 1_000, 2_000, 5_000, 10_000],
  },
  {
    code: 'INR',
    label: 'Indian Rupee',
    country: 'India',
    flag: '🇮🇳',
    decimals: 2,
    quickAmounts: [5_000, 10_000, 20_000, 50_000, 100_000],
  },
  {
    code: 'AUD',
    label: 'Australian Dollar',
    country: 'Australia',
    flag: '🇦🇺',
    decimals: 2,
    quickAmounts: [500, 1_000, 2_000, 5_000, 10_000],
  },
  {
    code: 'CAD',
    label: 'Canadian Dollar',
    country: 'Canada',
    flag: '🇨🇦',
    decimals: 2,
    quickAmounts: [500, 1_000, 2_000, 5_000, 10_000],
  },
]

export const CURRENCY_MAP = Object.fromEntries(
  CURRENCIES.map((currency) => [currency.code, currency]),
) as Record<CurrencyCode, CurrencyMeta>

export const PRIMARY_CURRENCIES = CURRENCIES.filter((currency) => currency.primary)
export const MORE_CURRENCIES = CURRENCIES.filter((currency) => !currency.primary)

export const CATEGORIES: CategoryMeta[] = [
  { id: 'food', label: 'Food', color: '#0284c7', soft: '#e0f2fe' },
  { id: 'transport', label: 'Transport', color: '#4f46e5', soft: '#eef2ff' },
  { id: 'shopping', label: 'Shopping', color: '#0891b2', soft: '#ecfeff' },
  { id: 'health', label: 'Health', color: '#e11d48', soft: '#fff1f2' },
  { id: 'education', label: 'Education', color: '#7c3aed', soft: '#f5f3ff' },
  { id: 'entertainment', label: 'Entertainment', color: '#d97706', soft: '#fffbeb' },
  { id: 'bills', label: 'Bills', color: '#2563eb', soft: '#eff6ff' },
  { id: 'gifts', label: 'Gifts', color: '#db2777', soft: '#fdf2f8' },
  { id: 'other', label: 'Other', color: '#64748b', soft: '#f1f5f9' },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
) as Record<CategoryId, CategoryMeta>

export const BUDGET_GROUP_IDS: BudgetGroupId[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'other',
]

export const BUDGET_GROUP_META: Record<BudgetGroupId, CategoryMeta> = {
  food: CATEGORY_MAP.food,
  transport: CATEGORY_MAP.transport,
  shopping: CATEGORY_MAP.shopping,
  bills: CATEGORY_MAP.bills,
  other: { ...CATEGORY_MAP.other, label: 'Others' },
}

export const DEFAULT_ALLOCATIONS: BudgetAllocations = {
  food: 30,
  transport: 15,
  shopping: 20,
  bills: 25,
  other: 10,
}

export const BUDGET_GROUP_FOR_CATEGORY: Record<CategoryId, BudgetGroupId> = {
  food: 'food',
  transport: 'transport',
  shopping: 'shopping',
  bills: 'bills',
  health: 'other',
  education: 'other',
  entertainment: 'other',
  gifts: 'other',
  other: 'other',
}

export const PAYMENT_METHODS = [
  'Cash',
  'KBZPay',
  'WavePay',
  'Visa Card',
  'Bank Transfer',
  'Mobile Wallet',
] as const

export const INCOME_SOURCES: IncomeSourceMeta[] = [
  { id: 'salary', label: 'Salary', color: '#059669', soft: '#ecfdf5' },
  { id: 'freelance', label: 'Freelance', color: '#0284c7', soft: '#e0f2fe' },
  { id: 'business', label: 'Business', color: '#7c3aed', soft: '#f5f3ff' },
  { id: 'investment', label: 'Investment', color: '#d97706', soft: '#fffbeb' },
  { id: 'gift', label: 'Gift', color: '#db2777', soft: '#fdf2f8' },
  { id: 'other', label: 'Other', color: '#64748b', soft: '#f1f5f9' },
]

export const INCOME_SOURCE_MAP = Object.fromEntries(
  INCOME_SOURCES.map((source) => [source.id, source]),
) as Record<IncomeSourceId, IncomeSourceMeta>

export const BILL_FREQUENCIES: { id: BillFrequency; label: string }[] = [
  { id: 'once', label: 'One time' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
]
