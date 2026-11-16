import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, Plus, Trash } from '@phosphor-icons/react'
import { getDaysInMonth, isSameMonth, parseISO } from 'date-fns'
import { useFinance } from '@/contexts/FinanceContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { MonthSwitcher } from '@/components/ui/MonthSwitcher'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { IncomeIcon } from '@/components/ui/IncomeIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyArt } from '@/components/art/Illustrations'
import { INCOME_SOURCES, INCOME_SOURCE_MAP } from '@/lib/constants'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Income as IncomeEntry, IncomeSourceId } from '@/types'

type Filter = 'all' | IncomeSourceId

export function Income() {
  const { incomes, loading, deleteIncome } = useFinance()
  const { profile } = useProfile()
  const toast = useToast()
  const [month, setMonth] = useState(() => new Date())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [toDelete, setToDelete] = useState<IncomeEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  const currency = profile?.currency ?? 'MMK'

  const monthIncomes = useMemo(
    () =>
      incomes.filter((income) => {
        const date = parseISO(income.date)
        return !Number.isNaN(date.getTime()) && isSameMonth(date, month)
      }),
    [incomes, month],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return monthIncomes.filter((income) => {
      if (filter !== 'all' && income.source !== filter) return false
      if (!needle) return true
      return (
        income.note?.toLowerCase().includes(needle) ||
        INCOME_SOURCE_MAP[income.source]?.label.toLowerCase().includes(needle)
      )
    })
  }, [monthIncomes, filter, query])

  const groups = useMemo(() => {
    const map = new Map<string, IncomeEntry[]>()
    for (const income of filtered) {
      const list = map.get(income.date) ?? []
      list.push(income)
      map.set(income.date, list)
    }
    return Array.from(map.entries())
  }, [filtered])

  const total = monthIncomes.reduce((sum, income) => sum + income.amount, 0)
  const filteredTotal = filtered.reduce((sum, income) => sum + income.amount, 0)
  const days = isSameMonth(month, new Date())
    ? Math.max(1, new Date().getDate())
    : getDaysInMonth(month)
  const dailyAverage = total / days

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteIncome(toDelete)
      toast('Income deleted.', 'success')
      setToDelete(null)
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not delete that income.',
        'error',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Income"
        subtitle="Every payment that comes in, grouped by the day you received it."
        actions={
          <Link
            to="/income/new"
            className="hidden h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 sm:inline-flex"
          >
            <Plus size={16} weight="bold" />
            Add income
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <MonthSwitcher value={month} onChange={setMonth} />
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/expenses"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-extrabold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
          >
            Expenses
          </Link>
          <Link
            to="/income/new"
            className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 sm:hidden"
            aria-label="Add income"
          >
            <Plus size={18} weight="bold" />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Received in {formatDate(month, 'MMMM')}
          </p>
          <p className="mt-2 break-words text-xl font-extrabold tracking-tight text-emerald-700">
            {formatMoney(total, currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {monthIncomes.length} entr{monthIncomes.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Daily average
          </p>
          <p className="mt-2 break-words text-xl font-extrabold tracking-tight text-slate-900">
            {formatMoney(dailyAverage, currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Across {days} days</p>
        </div>
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Showing
          </p>
          <p className="mt-2 break-words text-xl font-extrabold tracking-tight text-slate-900">
            {formatMoney(filteredTotal, currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {filtered.length} matching entr{filtered.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Input
          placeholder="Search notes and income sources…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          icon={<MagnifyingGlass size={18} />}
          aria-label="Search income"
        />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="All"
            count={monthIncomes.length}
          />
          {INCOME_SOURCES.map((source) => {
            const count = monthIncomes.filter(
              (income) => income.source === source.id,
            ).length
            if (count === 0 && filter !== source.id) return null
            return (
              <FilterChip
                key={source.id}
                active={filter === source.id}
                onClick={() => setFilter(source.id)}
                label={source.label}
                count={count}
                color={source.color}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="grid place-items-center rounded-[26px] border border-slate-100 bg-white py-16">
            <Spinner size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            art={<EmptyArt className="w-full" />}
            title={
              monthIncomes.length === 0
                ? 'No income this month'
                : 'Nothing matches that filter'
            }
            description={
              monthIncomes.length === 0
                ? 'Add your first income and it will appear here, grouped by day.'
                : 'Try a different search or clear the source filter.'
            }
            action={
              monthIncomes.length === 0 ? (
                <Link
                  to="/income/new"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white transition hover:bg-emerald-700"
                >
                  <Plus size={16} weight="bold" />
                  Add income
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('')
                    setFilter('all')
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-sm lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                    <th className="px-5 py-3">Source</th>
                    <th className="px-3 py-3">Note</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((income) => (
                    <tr
                      key={income.id}
                      className="border-b border-slate-50 text-[13px] transition last:border-0 hover:bg-emerald-50/30"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <IncomeIcon source={income.source} size="sm" />
                          <span className="font-extrabold text-slate-700">
                            {INCOME_SOURCE_MAP[income.source]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-56 truncate px-3 py-3 text-slate-500">
                        {income.note?.trim() || '—'}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(income.date, 'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-extrabold text-emerald-700">
                        +{formatMoney(income.amount, currency)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setToDelete(income)}
                          className="grid size-8 place-items-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                          aria-label={`Delete ${income.note || 'income'}`}
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 lg:hidden">
              {groups.map(([date, items]) => {
                const dayTotal = items.reduce((sum, item) => sum + item.amount, 0)
                return (
                  <div key={date}>
                    <div className="mb-2 flex items-center justify-between px-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        {formatDate(date, 'EEE, MMM d')}
                      </p>
                      <p className="text-[11px] font-extrabold text-emerald-600">
                        +{formatMoney(dayTotal, currency)}
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-sm">
                      {items.map((income) => (
                        <div
                          key={income.id}
                          className="flex items-center gap-3 border-b border-slate-50 p-3.5 last:border-0"
                        >
                          <IncomeIcon source={income.source} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-extrabold text-slate-800">
                              {income.note?.trim() ||
                                INCOME_SOURCE_MAP[income.source]?.label}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {INCOME_SOURCE_MAP[income.source]?.label}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <p className="text-[13px] font-extrabold text-emerald-700">
                              +{formatMoney(income.amount, currency)}
                            </p>
                            <button
                              type="button"
                              onClick={() => setToDelete(income)}
                              className="grid size-7 place-items-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                              aria-label="Delete income"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
        loading={deleting}
        title="Delete this income?"
        description={
          toDelete
            ? `${formatMoney(toDelete.amount, currency)} on ${formatDate(toDelete.date)} will be removed from your history. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete income"
      />
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-extrabold transition',
        active
          ? 'border-emerald-500 bg-emerald-600 text-white'
          : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-700',
      )}
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: active ? '#ffffff' : color }}
        />
      )}
      {label}
      <span
        className={cn(
          'rounded-full px-1.5 text-[10px]',
          active ? 'bg-white/20' : 'bg-slate-100 text-slate-400',
        )}
      >
        {count}
      </span>
    </button>
  )
}
