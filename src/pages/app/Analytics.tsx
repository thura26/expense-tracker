import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChartDonut,
  Coins,
  PiggyBank,
  Plus,
  Receipt,
  TrendUp,
  Wallet,
} from '@phosphor-icons/react'
import { format, getDaysInMonth, isSameMonth, parseISO, subMonths } from 'date-fns'
import { useFinance } from '@/contexts/FinanceContext'
import { useProfile } from '@/contexts/ProfileContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { MonthSwitcher } from '@/components/ui/MonthSwitcher'
import { DonutChart, type DonutDatum } from '@/components/charts/DonutChart'
import { TrendChart, type TrendDatum } from '@/components/charts/TrendChart'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyArt } from '@/components/art/Illustrations'
import { CATEGORIES } from '@/lib/constants'
import {
  formatCompactMoney,
  formatMoney,
  percent,
} from '@/lib/format'
import { cn } from '@/lib/utils'

export function Analytics() {
  const { expenses, incomes } = useFinance()
  const { profile } = useProfile()
  const [month, setMonth] = useState(() => new Date())
  const currency = profile?.currency ?? 'MMK'

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

  const income = monthIncomes.reduce((sum, entry) => sum + entry.amount, 0)
  const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const days = isSameMonth(month, new Date())
    ? Math.max(1, new Date().getDate())
    : getDaysInMonth(month)
  const dailyAverage = total / days
  const savings = income - total
  const savingsRate = income > 0 ? (savings / income) * 100 : null

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const expense of monthExpenses) {
      map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount)
    }
    return CATEGORIES.map((category) => ({
      label: category.label,
      value: map.get(category.id) ?? 0,
      color: category.color,
      id: category.id,
    }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [monthExpenses])

  const donutData: DonutDatum[] = categoryData.map((item) => ({
    label: item.label,
    value: item.value,
    color: item.color,
  }))

  const trendData: TrendDatum[] = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const target = subMonths(month, 5 - index)
      const value = expenses
        .filter((expense) => {
          const date = parseISO(expense.date)
          return !Number.isNaN(date.getTime()) && isSameMonth(date, target)
        })
        .reduce((sum, expense) => sum + expense.amount, 0)
      return {
        label: format(target, 'MMM'),
        value,
        current: index === 5,
      }
    })
  }, [expenses, month])

  const topCategory = categoryData[0]
  const transactionCount = monthExpenses.length

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Analytics"
        subtitle="A calm look at where your money went, and what it means."
        actions={
          <div className="hidden sm:block">
            <MonthSwitcher value={month} onChange={setMonth} />
          </div>
        }
      />

      <div className="mb-4 sm:hidden">
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Income
            </p>
            <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet size={16} weight="duotone" />
            </span>
          </div>
          <p className="mt-2 break-words text-xl font-extrabold tracking-tight text-emerald-700">
            {formatMoney(income, currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {monthIncomes.length} entr{monthIncomes.length === 1 ? 'y' : 'ies'} this
            month
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Total spent
            </p>
            <span className="grid size-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <Receipt size={16} weight="duotone" />
            </span>
          </div>
          <p className="mt-2 break-words text-xl font-extrabold tracking-tight text-slate-900">
            {formatMoney(total, currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {transactionCount} transaction{transactionCount === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Daily average
            </p>
            <span className="grid size-8 place-items-center rounded-xl bg-indigo-50 text-indigo-500">
              <Coins size={16} weight="duotone" />
            </span>
          </div>
          <p className="mt-2 break-words text-xl font-extrabold tracking-tight text-slate-900">
            {formatMoney(dailyAverage, currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Across {days} days</p>
        </div>

        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Saved this month
            </p>
            <span
              className={cn(
                'grid size-8 place-items-center rounded-xl',
                savings >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-500',
              )}
            >
              <PiggyBank size={16} weight="duotone" />
            </span>
          </div>
          <p
            className={cn(
              'mt-2 break-words text-xl font-extrabold tracking-tight',
              savings >= 0 ? 'text-slate-900' : 'text-rose-600',
            )}
          >
            {formatMoney(savings, currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {savingsRate === null
              ? 'Add income to see your savings rate'
              : `${savingsRate >= 0 ? '+' : ''}${Math.round(savingsRate)}% of income`}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                Spending by category
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {format(month, 'MMMM yyyy')}
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <ChartDonut size={18} weight="duotone" />
            </span>
          </div>

          <DonutChart data={donutData}>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Total
            </p>
            <p className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
              {total > 0 ? formatCompactMoney(total, currency) : '—'}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
              {total > 0 ? `${categoryData.length} categories` : 'No spending yet'}
            </p>
          </DonutChart>

          {topCategory && (
            <div className="mt-4 rounded-2xl bg-sky-50 px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-sky-700">
                Top category
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <CategoryIcon category={topCategory.id} size="sm" />
                <p className="text-[13px] font-extrabold text-slate-800">
                  {topCategory.label}
                </p>
                <p className="ml-auto text-[12px] font-extrabold text-sky-700">
                  {Math.round(percent(topCategory.value, total))}%
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                Category breakdown
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Percentages of your monthly spending
              </p>
            </div>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-600 hover:text-sky-700"
            >
              Expenses
              <ArrowRight size={13} weight="bold" />
            </Link>
          </div>

          {categoryData.length === 0 ? (
            <EmptyState
              art={<EmptyArt className="w-full" />}
              title="No spending to analyse yet"
              description="Add a few expenses for this month and the breakdown will fill in automatically."
              action={
                <Link
                  to="/expenses/new"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-sky-600 px-4 text-xs font-extrabold text-white transition hover:bg-sky-700"
                >
                  <Plus size={14} weight="bold" />
                  Add expense
                </Link>
              }
              className="border-0 bg-transparent py-4"
            />
          ) : (
            <div className="space-y-4">
              {categoryData.map((item) => (
                <div key={item.id}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <CategoryIcon category={item.id} size="sm" />
                    <span className="text-[12px] font-extrabold text-slate-700">
                      {item.label}
                    </span>
                    <span className="ml-auto text-[11px] font-extrabold text-slate-500">
                      {formatMoney(item.value, currency)}
                    </span>
                    <span className="w-10 text-right text-[11px] font-extrabold text-slate-400">
                      {Math.round(percent(item.value, total))}%
                    </span>
                  </div>
                  <ProgressBar
                    value={percent(item.value, total)}
                    className="opacity-80"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                Six-month spending trend
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {format(subMonths(month, 5), 'MMM')} – {format(month, 'MMM yyyy')}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold text-emerald-700">
              <TrendUp size={13} weight="bold" />
              Lower bars are better
            </span>
          </div>
          <TrendChart
            data={trendData}
            formatValue={(value) => formatMoney(value, currency)}
          />
        </section>
      </div>

      <div className="mt-4 rounded-[24px] border border-sky-100 bg-sky-50/70 p-4 text-[12px] leading-relaxed text-sky-900">
        <span className="font-extrabold">How to read this:</span>{' '}
        {total === 0
          ? 'Your selected month has no expenses yet. Try a previous month or add an expense.'
          : topCategory
            ? `${topCategory.label} is your biggest category at ${Math.round(percent(topCategory.value, total))}% of spending. A daily average of ${formatMoney(dailyAverage, currency)} means small choices add up.`
            : 'Add expenses to see category insights.'}
      </div>
    </div>
  )
}
