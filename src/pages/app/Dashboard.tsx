import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowsClockwise,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  ChartDonut,
  Check,
  Eye,
  EyeSlash,
  Plus,
  Receipt,
  Sparkle,
  Target,
  TrendDown,
  TrendUp,
  Wallet,
} from '@phosphor-icons/react'
import {
  differenceInCalendarDays,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { useProfile } from '@/contexts/ProfileContext'
import { useFinance } from '@/contexts/FinanceContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { MonthSwitcher } from '@/components/ui/MonthSwitcher'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { IncomeIcon } from '@/components/ui/IncomeIcon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyArt } from '@/components/art/Illustrations'
import {
  firstName,
  formatDate,
  formatMoney,
  percent,
  relativeDueLabel,
} from '@/lib/format'
import {
  BUDGET_GROUP_IDS,
  BUDGET_GROUP_META,
  CATEGORY_MAP,
  INCOME_SOURCE_MAP,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Bill, Expense, Income as IncomeEntry, IncomeSourceId } from '@/types'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

type ActivityItem =
  | {
      kind: 'expense'
      id: string
      date: string
      createdAt: string
      expense: Expense
    }
  | {
      kind: 'income'
      id: string
      date: string
      createdAt: string
      income: IncomeEntry
    }

export function Dashboard() {
  const { profile } = useProfile()
  const { expenses, incomes, bills, refresh, refreshing, markBillPaid } = useFinance()
  const toast = useToast()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [hidden, setHidden] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

  const currency = profile?.currency ?? 'MMK'
  const budgetTotal = profile?.budget.total ?? 0

  const monthExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const date = parseISO(expense.date)
        return !Number.isNaN(date.getTime()) && isSameMonth(date, month)
      }),
    [expenses, month],
  )

  const monthIncomes = useMemo(
    () =>
      incomes.filter((income) => {
        const date = parseISO(income.date)
        return !Number.isNaN(date.getTime()) && isSameMonth(date, month)
      }),
    [incomes, month],
  )

  const totalSpent = useMemo(
    () => monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [monthExpenses],
  )

  const totalIncome = useMemo(
    () => monthIncomes.reduce((sum, income) => sum + income.amount, 0),
    [monthIncomes],
  )

  const previousMonth = subMonths(month, 1)
  const previousSpent = useMemo(
    () =>
      expenses
        .filter((expense) => {
          const date = parseISO(expense.date)
          return !Number.isNaN(date.getTime()) && isSameMonth(date, previousMonth)
        })
        .reduce((sum, expense) => sum + expense.amount, 0),
    [expenses, previousMonth],
  )

  const previousIncome = useMemo(
    () =>
      incomes
        .filter((income) => {
          const date = parseISO(income.date)
          return !Number.isNaN(date.getTime()) && isSameMonth(date, previousMonth)
        })
        .reduce((sum, income) => sum + income.amount, 0),
    [incomes, previousMonth],
  )

  const balance = totalIncome - totalSpent
  const remaining = budgetTotal - totalSpent
  const usedPercent = percent(totalSpent, budgetTotal)
  const previousBalance = previousIncome - previousSpent
  const delta =
    Math.abs(previousBalance) > 0
      ? ((balance - previousBalance) / Math.abs(previousBalance)) * 100
      : null

  const recentActivity = useMemo(() => {
    const items: ActivityItem[] = [
      ...monthExpenses.map((expense) => ({
        kind: 'expense' as const,
        id: `expense-${expense.id}`,
        date: expense.date,
        createdAt: expense.createdAt ?? '',
        expense,
      })),
      ...monthIncomes.map((income) => ({
        kind: 'income' as const,
        id: `income-${income.id}`,
        date: income.date,
        createdAt: income.createdAt ?? '',
        income,
      })),
    ]
    return items
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.createdAt.localeCompare(a.createdAt),
      )
      .slice(0, 5)
  }, [monthExpenses, monthIncomes])

  const topIncomeSource = useMemo(() => {
    const totals = new Map<IncomeSourceId, number>()
    for (const income of monthIncomes) {
      totals.set(income.source, (totals.get(income.source) ?? 0) + income.amount)
    }
    const top = [...totals.entries()].sort((a, b) => b[1] - a[1])[0]
    return top ? INCOME_SOURCE_MAP[top[0]] : null
  }, [monthIncomes])

  const upcomingBills = useMemo(() => {
    return [...bills]
      .filter((bill) => bill.active)
      .sort(
        (a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(),
      )
      .slice(0, 3)
  }, [bills])

  async function handlePayBill(bill: Bill) {
    setPayingId(bill.id)
    try {
      await markBillPaid(bill)
      toast(`${bill.title} marked as paid`, 'success')
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not mark bill as paid.',
        'error',
      )
    } finally {
      setPayingId(null)
    }
  }

  const displayAmount = hidden ? `${currency} ••••••` : formatMoney(balance, currency)
  const displaySpent = hidden ? '••••••' : formatMoney(totalSpent, currency)
  const displayIncome = hidden ? '••••••' : formatMoney(totalIncome, currency)
  const displayRemaining = hidden ? '••••••' : formatMoney(remaining, currency)

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={formatDate(new Date(), 'EEEE, MMMM d')}
        title={`${greeting()}, ${firstName(profile?.displayName, profile?.email)}`}
        subtitle="Here is your money at a glance — calm, clear, and up to date."
        actions={
          <div className="hidden sm:block">
            <MonthSwitcher value={month} onChange={setMonth} />
          </div>
        }
      />

      <div className="mb-4 sm:hidden">
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="order-1 lg:col-span-8">
          <div className="hero-shadow relative overflow-hidden rounded-[30px] bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 p-5 text-white sm:p-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-cyan-300/20 blur-2xl" />
              <div className="absolute right-6 top-7 hidden h-24 w-36 rotate-6 rounded-2xl border border-white/20 bg-white/10 p-3 sm:block lg:hidden xl:block">
                <div className="mb-2 h-1.5 w-10 rounded-full bg-white/40" />
                <div className="flex items-end gap-1.5">
                  <div className="h-5 w-3 rounded-sm bg-white/35" />
                  <div className="h-8 w-3 rounded-sm bg-white/50" />
                  <div className="h-11 w-3 rounded-sm bg-white/70" />
                  <div className="h-14 w-3 rounded-sm bg-white" />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-100/80">
                    Total balance
                  </p>
                  <p className="mt-1 text-[11px] text-sky-100/70">
                    {formatDate(month, 'MMMM yyyy')} · income minus expenses
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHidden((current) => !current)}
                  className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label={hidden ? 'Show balance' : 'Hide balance'}
                >
                  {hidden ? <EyeSlash size={19} /> : <Eye size={19} />}
                </button>
              </div>

              <p className="mt-4 break-words text-[clamp(1.8rem,5.5vw,2.9rem)] font-extrabold leading-none tracking-[-0.05em]">
                {displayAmount}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {delta !== null ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold',
                      delta >= 0
                        ? 'bg-emerald-400/20 text-emerald-50'
                        : 'bg-rose-400/20 text-rose-50',
                    )}
                  >
                    {delta >= 0 ? (
                      <TrendUp size={13} weight="bold" />
                    ) : (
                      <TrendDown size={13} weight="bold" />
                    )}
                    {delta >= 0 ? '+' : ''}
                    {delta.toFixed(1)}% vs last month
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-extrabold text-sky-50">
                    <Sparkle size={13} weight="fill" />
                    This month so far
                  </span>
                )}
                {hidden && (
                  <span className="text-[11px] font-semibold text-sky-100/70">
                    Balance hidden
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[11px] font-extrabold text-sky-50 transition hover:bg-white/20"
                >
                  <ArrowsClockwise
                    size={15}
                    weight="bold"
                    className={refreshing ? 'animate-spin-slow' : undefined}
                  />
                  {refreshing ? 'Refreshing…' : 'Refresh data'}
                </button>
                <Link
                  to="/income"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-extrabold text-sky-700 shadow-sm transition hover:bg-sky-50"
                >
                  <ArrowUpRight size={15} weight="bold" />
                  {totalIncome > 0 ? 'Manage income' : 'Add income'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="order-4 lg:order-2 lg:col-span-4">
          <div className="flex h-full flex-col rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                Quick actions
              </h2>
              <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-600">
                Shortcuts
              </span>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-2.5">
              <QuickAction
                to="/expenses/new"
                label="Add expense"
                icon={<Plus size={19} weight="bold" />}
                className="bg-sky-600 text-white hover:bg-sky-700"
              />
              <QuickAction
                to="/income/new"
                label="Add income"
                icon={<ArrowDownLeft size={19} weight="bold" />}
                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              />
              <QuickAction
                to="/bills?new=1"
                label="Add bill"
                icon={<CalendarBlank size={19} weight="duotone" />}
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              />
              <QuickAction
                to="/analytics"
                label="Reports"
                icon={<ChartDonut size={19} weight="duotone" />}
                className="bg-amber-50 text-amber-600 hover:bg-amber-100"
              />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
              Small habits add up. Log money in and out the moment it happens.
            </p>
          </div>
        </section>

        <section className="order-2 grid grid-cols-2 gap-3 lg:order-3 lg:col-span-8">
          <MiniStat
            label="Monthly expenses"
            value={displaySpent}
            caption={`${monthExpenses.length} transaction${monthExpenses.length === 1 ? '' : 's'}`}
            icon={<Receipt size={18} weight="duotone" />}
            tone="rose"
            to="/expenses"
          />
          <MiniStat
            label="Monthly income"
            value={displayIncome}
            caption={
              topIncomeSource
                ? `${topIncomeSource.label} · ${monthIncomes.length} entr${monthIncomes.length === 1 ? 'y' : 'ies'}`
                : 'No income recorded yet'
            }
            icon={<Wallet size={18} weight="duotone" />}
            tone="emerald"
            to="/income"
          />
        </section>

        <section className="order-3 lg:order-4 lg:col-span-4">
          <div className="flex h-full flex-col rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                  Remaining budget
                </p>
                <p
                  className={cn(
                    'mt-2 break-words text-xl font-extrabold tracking-tight sm:text-2xl',
                    remaining < 0 ? 'text-rose-600' : 'text-slate-900',
                  )}
                >
                  {displayRemaining}
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                <Target size={20} weight="duotone" />
              </span>
            </div>

            {budgetTotal > 0 ? (
              <>
                <div className="mt-4">
                  <ProgressBar
                    value={usedPercent}
                    tone={usedPercent >= 100 ? 'rose' : usedPercent >= 80 ? 'amber' : 'sky'}
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>{Math.round(usedPercent)}% used</span>
                    <Link
                      to="/setup/budget"
                      className="font-extrabold text-sky-600 hover:text-sky-700"
                    >
                      Edit budget
                    </Link>
                  </div>
                </div>
                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
                  {BUDGET_GROUP_IDS.map((key) => (
                    <div
                      key={key}
                      style={{
                        width: `${profile?.budget.allocations[key] ?? 0}%`,
                        backgroundColor: BUDGET_GROUP_META[key].color,
                      }}
                      title={`${BUDGET_GROUP_META[key].label} ${profile?.budget.allocations[key] ?? 0}%`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  {remaining < 0
                    ? `You are ${formatMoney(Math.abs(remaining), currency)} over budget this month.`
                    : `${formatMoney(remaining, currency)} left across your categories.`}
                </p>
              </>
            ) : (
              <div className="mt-4 flex flex-1 flex-col justify-between">
                <p className="text-[12px] leading-relaxed text-slate-500">
                  No budget yet. Set one to see how much is safe to spend for the rest
                  of the month.
                </p>
                <Link
                  to="/setup/budget"
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-sky-100 text-xs font-extrabold text-sky-700 transition hover:bg-sky-200"
                >
                  Set monthly budget
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="order-5 lg:col-span-7">
          <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                  Recent activity
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Money in and out in {formatDate(month, 'MMMM')}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Link
                  to="/income"
                  className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-700"
                >
                  Income
                </Link>
                <Link
                  to="/expenses"
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-600 hover:text-sky-700"
                >
                  Expenses
                  <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 px-4 py-7 text-center">
                <div className="w-24">
                  <EmptyArt className="w-full" />
                </div>
                <p className="mt-2 text-[13px] font-extrabold text-slate-700">
                  No activity this month yet
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Add an expense or your first income to bring the dashboard to life.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Link
                    to="/expenses/new"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-sky-600 px-4 text-[11px] font-extrabold text-white transition hover:bg-sky-700"
                  >
                    <Plus size={13} weight="bold" />
                    Add expense
                  </Link>
                  <Link
                    to="/income/new"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-[11px] font-extrabold text-white transition hover:bg-emerald-700"
                  >
                    <ArrowDownLeft size={13} weight="bold" />
                    Add income
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((entry) => {
                  if (entry.kind === 'expense') {
                    const expense = entry.expense
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-slate-50"
                      >
                        <CategoryIcon category={expense.category} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-extrabold text-slate-800">
                            {expense.note?.trim() ||
                              CATEGORY_MAP[expense.category]?.label ||
                              'Expense'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatDate(expense.date, 'MMM d')} ·{' '}
                            {expense.paymentMethod}
                          </p>
                        </div>
                        <p className="shrink-0 text-[13px] font-extrabold text-slate-900">
                          {hidden
                            ? '••••'
                            : `-${formatMoney(expense.amount, currency)}`}
                        </p>
                      </div>
                    )
                  }

                  const income = entry.income
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-slate-50"
                    >
                      <IncomeIcon source={income.source} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-extrabold text-slate-800">
                          {income.note?.trim() ||
                            INCOME_SOURCE_MAP[income.source]?.label ||
                            'Income'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(income.date, 'MMM d')} ·{' '}
                          {INCOME_SOURCE_MAP[income.source]?.label}
                        </p>
                      </div>
                      <p className="shrink-0 text-[13px] font-extrabold text-emerald-600">
                        {hidden
                          ? '••••'
                          : `+${formatMoney(income.amount, currency)}`}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section className="order-6 lg:col-span-5">
          <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                  Upcoming bills
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  The next three on your list
                </p>
              </div>
              <Link
                to="/bills"
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-600 hover:text-sky-700"
              >
                Manage
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 px-4 py-7 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-sky-500 shadow-sm">
                  <CalendarBlank size={24} weight="duotone" />
                </span>
                <p className="mt-2 text-[13px] font-extrabold text-slate-700">
                  No bills added
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Add rent, internet, or subscriptions so nothing sneaks up.
                </p>
                <Link
                  to="/bills?new=1"
                  className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-sky-600 px-4 text-[11px] font-extrabold text-white transition hover:bg-sky-700"
                >
                  <Plus size={13} weight="bold" />
                  Add bill
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingBills.map((bill) => {
                  const days = differenceInCalendarDays(parseISO(bill.dueDate), new Date())
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 p-2.5"
                    >
                      <CategoryIcon category={bill.category} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-extrabold text-slate-800">
                          {bill.title}
                        </p>
                        <p
                          className={cn(
                            'text-[11px] font-semibold',
                            days < 0 ? 'text-rose-500' : days <= 3 ? 'text-amber-600' : 'text-slate-400',
                          )}
                        >
                          {relativeDueLabel(bill.dueDate)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="text-[12px] font-extrabold text-slate-900">
                          {hidden ? '••••' : formatMoney(bill.amount, currency)}
                        </p>
                        <button
                          type="button"
                          onClick={() => void handlePayBill(bill)}
                          disabled={payingId === bill.id}
                          className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[10px] font-extrabold text-sky-700 transition hover:bg-sky-100 disabled:opacity-50"
                        >
                          <Check size={11} weight="bold" />
                          {payingId === bill.id ? 'Paying…' : 'Mark paid'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>

    </div>
  )
}

function QuickAction({
  to,
  label,
  icon,
  className,
}: {
  to: string
  label: string
  icon: ReactNode
  className: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl px-2 text-center text-[11px] font-extrabold leading-tight transition',
        className,
      )}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-white/20">{icon}</span>
      {label}
    </Link>
  )
}

function MiniStat({
  label,
  value,
  caption,
  icon,
  tone,
  to,
  onClick,
}: {
  label: string
  value: string
  caption: string
  icon: ReactNode
  tone: 'rose' | 'emerald'
  to?: string
  onClick?: () => void
}) {
  const tones = {
    rose: 'bg-rose-50 text-rose-500',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  const content = (
    <div className="flex h-full flex-col rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-sky-100">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
          {label}
        </p>
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-xl', tones[tone])}>
          {icon}
        </span>
      </div>
      <p className="mt-3 break-words text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
        {value}
      </p>
      <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">{caption}</p>
    </div>
  )
  if (to) return <Link to={to}>{content}</Link>
  return (
    <button type="button" onClick={onClick} className="text-left">
      {content}
    </button>
  )
}
