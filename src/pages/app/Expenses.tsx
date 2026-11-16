import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlass,
  Plus,
  Receipt,
  Trash,
} from '@phosphor-icons/react'
import { getDaysInMonth, isSameMonth, parseISO } from 'date-fns'
import { useFinance } from '@/contexts/FinanceContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { MonthSwitcher } from '@/components/ui/MonthSwitcher'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyArt } from '@/components/art/Illustrations'
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CategoryId, Expense } from '@/types'

type Filter = 'all' | CategoryId

export function Expenses() {
  const { expenses, loading, deleteExpense, getReceiptUrl } = useFinance()
  const { profile } = useProfile()
  const toast = useToast()
  const [month, setMonth] = useState(() => new Date())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [toDelete, setToDelete] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)

  const currency = profile?.currency ?? 'MMK'

  const monthExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const date = parseISO(expense.date)
        return !Number.isNaN(date.getTime()) && isSameMonth(date, month)
      }),
    [expenses, month],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return monthExpenses.filter((expense) => {
      if (filter !== 'all' && expense.category !== filter) return false
      if (!needle) return true
      return (
        expense.note?.toLowerCase().includes(needle) ||
        expense.paymentMethod.toLowerCase().includes(needle) ||
        CATEGORY_MAP[expense.category]?.label.toLowerCase().includes(needle)
      )
    })
  }, [monthExpenses, filter, query])

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const expense of filtered) {
      const list = map.get(expense.date) ?? []
      list.push(expense)
      map.set(expense.date, list)
    }
    return Array.from(map.entries())
  }, [filtered])

  const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const filteredTotal = filtered.reduce((sum, expense) => sum + expense.amount, 0)
  const days = isSameMonth(month, new Date())
    ? Math.max(1, new Date().getDate())
    : getDaysInMonth(month)
  const dailyAverage = total / days

  async function openReceipt(expense: Expense) {
    if (!expense.receiptPath) return
    setOpeningId(expense.id)
    try {
      const url = await getReceiptUrl(expense.receiptPath)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
      else toast('Could not create a receipt link.', 'error')
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not open that receipt.',
        'error',
      )
    } finally {
      setOpeningId(null)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteExpense(toDelete)
      toast('Expense deleted.', 'success')
      setToDelete(null)
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not delete that expense.',
        'error',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Expenses"
        subtitle="Every transaction, grouped by the day you spent it."
        actions={
          <Link
            to="/expenses/new"
            className="hidden h-11 items-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-sky-700 sm:inline-flex"
          >
            <Plus size={16} weight="bold" />
            Add expense
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <MonthSwitcher value={month} onChange={setMonth} />
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/categories"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-extrabold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
          >
            Categories
          </Link>
          <Link
            to="/expenses/new"
            className="inline-flex size-10 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm transition hover:bg-sky-700 sm:hidden"
            aria-label="Add expense"
          >
            <Plus size={18} weight="bold" />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Spent in {formatDate(month, 'MMMM')}
          </p>
          <p className="mt-2 break-words text-xl font-extrabold tracking-tight text-slate-900">
            {formatMoney(total, currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {monthExpenses.length} transaction{monthExpenses.length === 1 ? '' : 's'}
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
            {filtered.length} matching transaction{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Input
          placeholder="Search notes, payment methods, categories…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          icon={<MagnifyingGlass size={18} />}
          aria-label="Search expenses"
        />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="All"
            count={monthExpenses.length}
          />
          {CATEGORIES.map((category) => {
            const count = monthExpenses.filter(
              (expense) => expense.category === category.id,
            ).length
            if (count === 0 && filter !== category.id) return null
            return (
              <FilterChip
                key={category.id}
                active={filter === category.id}
                onClick={() => setFilter(category.id)}
                label={category.label}
                count={count}
                color={category.color}
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
            title={monthExpenses.length === 0 ? 'No expenses this month' : 'Nothing matches that filter'}
            description={
              monthExpenses.length === 0
                ? 'Add your first expense and it will appear here, grouped by day.'
                : 'Try a different search or clear the category filter.'
            }
            action={
              monthExpenses.length === 0 ? (
                <Link
                  to="/expenses/new"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-extrabold text-white transition hover:bg-sky-700"
                >
                  <Plus size={16} weight="bold" />
                  Add expense
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
                    <th className="px-5 py-3">Category</th>
                    <th className="px-3 py-3">Note</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3">Receipt</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-50 text-[13px] transition last:border-0 hover:bg-sky-50/30"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <CategoryIcon category={expense.category} size="sm" />
                          <span className="font-extrabold text-slate-700">
                            {CATEGORY_MAP[expense.category]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-56 truncate px-3 py-3 text-slate-500">
                        {expense.note?.trim() || '—'}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(expense.date, 'MMM d, yyyy')}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {expense.paymentMethod}
                      </td>
                      <td className="px-3 py-3">
                        {expense.receiptPath ? (
                          <button
                            type="button"
                            onClick={() => void openReceipt(expense)}
                            disabled={openingId === expense.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-extrabold text-sky-700 transition hover:bg-sky-100 disabled:opacity-50"
                          >
                            <Receipt size={13} weight="duotone" />
                            {openingId === expense.id ? 'Opening…' : 'View'}
                          </button>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-extrabold text-slate-900">
                        {formatMoney(expense.amount, currency)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setToDelete(expense)}
                          className="grid size-8 place-items-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                          aria-label={`Delete ${expense.note || 'expense'}`}
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
                      <p className="text-[11px] font-extrabold text-slate-500">
                        {formatMoney(dayTotal, currency)}
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-sm">
                      {items.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center gap-3 border-b border-slate-50 p-3.5 last:border-0"
                        >
                          <CategoryIcon category={expense.category} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-extrabold text-slate-800">
                              {expense.note?.trim() ||
                                CATEGORY_MAP[expense.category]?.label}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {CATEGORY_MAP[expense.category]?.label} ·{' '}
                              {expense.paymentMethod}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <p className="text-[13px] font-extrabold text-slate-900">
                              {formatMoney(expense.amount, currency)}
                            </p>
                            <div className="flex items-center gap-0.5">
                              {expense.receiptPath && (
                                <button
                                  type="button"
                                  onClick={() => void openReceipt(expense)}
                                  disabled={openingId === expense.id}
                                  className="grid size-7 place-items-center rounded-full text-sky-500 transition hover:bg-sky-50 disabled:opacity-50"
                                  aria-label="View receipt"
                                >
                                  <Receipt size={14} weight="duotone" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setToDelete(expense)}
                                className="grid size-7 place-items-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                                aria-label="Delete expense"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
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

      <Link
        to="/expenses/new"
        className="fixed bottom-20 right-4 z-20 grid size-14 place-items-center rounded-full bg-sky-600 text-white shadow-[0_18px_36px_-12px_rgba(2,132,199,0.8)] transition hover:bg-sky-700 sm:hidden"
        aria-label="Add expense"
      >
        <Plus size={24} weight="bold" />
      </Link>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
        loading={deleting}
        title="Delete this expense?"
        description={
          toDelete
            ? `${formatMoney(toDelete.amount, currency)} on ${formatDate(toDelete.date)} will be removed from your history. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete expense"
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
          ? 'border-sky-500 bg-sky-600 text-white'
          : 'border-slate-200 bg-white text-slate-500 hover:border-sky-200 hover:text-sky-700',
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
