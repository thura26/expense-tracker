import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChartDonut, Check, Sparkle, TrendUp } from '@phosphor-icons/react'
import { isSameMonth, parseISO } from 'date-fns'
import { useFinance } from '@/contexts/FinanceContext'
import { useProfile } from '@/contexts/ProfileContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { MonthSwitcher } from '@/components/ui/MonthSwitcher'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { Spinner } from '@/components/ui/Spinner'
import { CATEGORIES } from '@/lib/constants'
import { formatMoney, percent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CategoryId } from '@/types'

export function Categories() {
  const { expenses, loading } = useFinance()
  const { profile } = useProfile()
  const [month, setMonth] = useState(() => new Date())
  const [selected, setSelected] = useState<CategoryId>('food')
  const currency = profile?.currency ?? 'MMK'

  const monthExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const date = parseISO(expense.date)
        return !Number.isNaN(date.getTime()) && isSameMonth(date, month)
      }),
    [expenses, month],
  )

  const totals = useMemo(() => {
    const map = new Map<CategoryId, { total: number; count: number }>()
    for (const category of CATEGORIES) {
      map.set(category.id, { total: 0, count: 0 })
    }
    for (const expense of monthExpenses) {
      const current = map.get(expense.category) ?? { total: 0, count: 0 }
      map.set(expense.category, {
        total: current.total + expense.amount,
        count: current.count + 1,
      })
    }
    return map
  }, [monthExpenses])

  const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const topCategory = [...CATEGORIES]
    .map((category) => ({ category, total: totals.get(category.id)?.total ?? 0 }))
    .sort((a, b) => b.total - a.total)[0]
  const usedCount = CATEGORIES.filter(
    (category) => (totals.get(category.id)?.count ?? 0) > 0,
  ).length
  const selectedMeta = CATEGORIES.find((category) => category.id === selected)!
  const selectedTotal = totals.get(selected)?.total ?? 0

  return (
    <div className="animate-fade-up pb-32 lg:pb-0">
      <PageHeader
        title="Expense categories"
        subtitle="See where your money goes, then add a new expense in the right category."
        backTo="/expenses"
        actions={
          <Link
            to="/analytics"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-extrabold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700 sm:inline-flex"
          >
            Open analytics
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <MonthSwitcher value={month} onChange={setMonth} />
        <span className="rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-extrabold text-sky-700">
          {usedCount} of {CATEGORIES.length} categories used
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Total spent
          </p>
          <p className="mt-2 break-words text-xl font-extrabold tracking-tight text-slate-900">
            {formatMoney(totalSpent, currency)}
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Top category
          </p>
          <p className="mt-2 truncate text-xl font-extrabold tracking-tight text-slate-900">
            {topCategory && topCategory.total > 0 ? topCategory.category.label : '—'}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {topCategory && topCategory.total > 0
              ? `${Math.round(percent(topCategory.total, totalSpent))}% of spending`
              : 'No spending yet'}
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Transactions
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
            {monthExpenses.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">This month</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 grid place-items-center rounded-[26px] border border-slate-100 bg-white py-16">
          <Spinner size={28} />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => {
            const stats = totals.get(category.id) ?? { total: 0, count: 0 }
            const active = selected === category.id
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelected(category.id)}
                className={cn(
                  'relative flex min-h-[124px] flex-col items-center justify-center gap-2 rounded-[22px] border bg-white p-3 text-center shadow-sm transition sm:min-h-[140px]',
                  active
                    ? 'border-sky-400 bg-sky-50 shadow-[0_14px_30px_-20px_rgba(2,132,199,0.8)]'
                    : 'border-slate-100 hover:border-sky-200 hover:bg-sky-50/40',
                )}
                aria-pressed={active}
              >
                <CategoryIcon category={category.id} size="lg" />
                <span className="text-[11px] font-extrabold leading-tight text-slate-700 sm:text-xs">
                  {category.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {stats.total > 0 ? formatMoney(stats.total, currency) : 'No spending'}
                </span>
                {active && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-sky-600 text-white">
                    <Check size={11} weight="bold" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-sky-500 to-sky-700 p-5 text-white shadow-lg sm:p-6">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
          <div className="relative flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15">
              <ChartDonut size={22} weight="duotone" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Track your spending
              </h2>
              <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-sky-100/90">
                See category percentages, your daily average, and a six-month trend in
                the analytics view.
              </p>
              <Link
                to="/analytics"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-extrabold text-sky-700 transition hover:bg-sky-50"
              >
                View reports
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkle size={18} weight="fill" />
            </span>
            <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
              A small insight
            </h2>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
            {totalSpent === 0
              ? 'Once you add expenses, MoneyTrack will highlight the categories that deserve a closer look.'
              : `${selectedMeta.label} accounts for ${Math.round(percent(selectedTotal, totalSpent))}% of this month’s spending.`}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-extrabold text-sky-700">
            <TrendUp size={15} weight="bold" />
            Selected: {selectedMeta.label}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-slate-100 bg-canvas/95 p-3 backdrop-blur-xl lg:static lg:mt-5 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <Link
          to={`/expenses/new?category=${selected}`}
          className="mx-auto flex h-13 w-full max-w-xl items-center justify-center gap-2 rounded-full bg-sky-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 lg:max-w-none"
        >
          Add {selectedMeta.label.toLowerCase()} expense
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  )
}
