import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarBlank,
  Check,
  PencilSimple,
  Plus,
  Receipt,
  Trash,
  WarningCircle,
} from '@phosphor-icons/react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useFinance } from '@/contexts/FinanceContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { Input, SelectField } from '@/components/ui/Input'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyArt } from '@/components/art/Illustrations'
import { BILL_FREQUENCIES, CATEGORIES, CATEGORY_MAP, CURRENCY_MAP } from '@/lib/constants'
import { formatAmountInput, formatDate, formatMoney, parseAmount, relativeDueLabel } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Bill, BillFrequency, CategoryId, CurrencyCode } from '@/types'

type Filter = 'all' | 'overdue' | 'soon'

export function Bills() {
  const { bills, loading, markBillPaid, deleteBill } = useFinance()
  const { profile } = useProfile()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('all')
  const [formOpen, setFormOpen] = useState(params.get('new') === '1')
  const [editing, setEditing] = useState<Bill | null>(null)
  const [toDelete, setToDelete] = useState<Bill | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

  const currency = profile?.currency ?? 'MMK'

  const activeBills = useMemo(
    () =>
      [...bills]
        .filter((bill) => bill.active)
        .sort(
          (a, b) =>
            parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(),
        ),
    [bills],
  )

  const withDays = useMemo(
    () =>
      activeBills.map((bill) => ({
        bill,
        days: differenceInCalendarDays(parseISO(bill.dueDate), new Date()),
      })),
    [activeBills],
  )

  const filtered = withDays.filter(({ days }) => {
    if (filter === 'overdue') return days < 0
    if (filter === 'soon') return days >= 0 && days <= 7
    return true
  })

  const overdueCount = withDays.filter(({ days }) => days < 0).length
  const soonCount = withDays.filter(({ days }) => days >= 0 && days <= 7).length
  const recurringTotal = activeBills
    .filter((bill) => bill.frequency !== 'once')
    .reduce((sum, bill) => sum + bill.amount, 0)
  const monthlyTotal = activeBills.reduce((sum, bill) => sum + bill.amount, 0)

  const recentlyPaid = useMemo(
    () =>
      [...bills]
        .filter((bill) => !bill.active && bill.lastPaidAt)
        .sort(
          (a, b) =>
            parseISO(b.lastPaidAt ?? '').getTime() -
            parseISO(a.lastPaidAt ?? '').getTime(),
        )
        .slice(0, 3),
    [bills],
  )

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
    if (params.get('new')) setParams({}, { replace: true })
  }

  function openEdit(bill: Bill) {
    setEditing(bill)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    if (params.get('new')) setParams({}, { replace: true })
  }

  async function handlePay(bill: Bill) {
    setPayingId(bill.id)
    try {
      await markBillPaid(bill)
      toast(`${bill.title} marked as paid.`, 'success')
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not mark bill as paid.',
        'error',
      )
    } finally {
      setPayingId(null)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteBill(toDelete)
      toast('Bill deleted.', 'success')
      setToDelete(null)
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not delete that bill.',
        'error',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Bills"
        subtitle="Rent, internet, subscriptions — see what is due before it becomes urgent."
        actions={
          <Button onClick={openAdd} leftIcon={<Plus size={16} weight="bold" />}>
            Add bill
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Active bills
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
            {activeBills.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {formatMoney(monthlyTotal, currency)} in total
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Overdue
          </p>
          <p className={cn('mt-2 text-xl font-extrabold tracking-tight', overdueCount > 0 ? 'text-rose-600' : 'text-slate-900')}>
            {overdueCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {overdueCount > 0 ? 'Needs attention now' : 'Nothing overdue'}
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Due within 7 days
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
            {soonCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {formatMoney(recurringTotal, currency)} recurring total
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All active"
          count={activeBills.length}
        />
        <FilterButton
          active={filter === 'overdue'}
          onClick={() => setFilter('overdue')}
          label="Overdue"
          count={overdueCount}
          tone="rose"
        />
        <FilterButton
          active={filter === 'soon'}
          onClick={() => setFilter('soon')}
          label="Due soon"
          count={soonCount}
          tone="amber"
        />
        <span className="ml-auto hidden text-[11px] font-semibold text-slate-400 sm:block">
          Marking a bill paid also adds an expense.
        </span>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid place-items-center rounded-[26px] border border-slate-100 bg-white py-16">
            <Spinner size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            art={<EmptyArt className="w-full" />}
            title={
              activeBills.length === 0
                ? 'No bills added yet'
                : 'Nothing in this filter'
            }
            description={
              activeBills.length === 0
                ? 'Add rent, internet, or a subscription and MoneyTrack will remind you before it is due.'
                : 'Try another filter to see the rest of your bills.'
            }
            action={
              activeBills.length === 0 ? (
                <Button onClick={openAdd} leftIcon={<Plus size={16} weight="bold" />}>
                  Add your first bill
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setFilter('all')}>
                  Show all active bills
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(({ bill, days }) => (
              <BillCard
                key={bill.id}
                bill={bill}
                days={days}
                currency={currency}
                paying={payingId === bill.id}
                onPay={() => void handlePay(bill)}
                onEdit={() => openEdit(bill)}
                onDelete={() => setToDelete(bill)}
              />
            ))}
          </div>
        )}
      </div>

      {recentlyPaid.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 px-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Recently paid
          </h2>
          <div className="space-y-2">
            {recentlyPaid.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/70 p-3"
              >
                <span className="grid size-9 place-items-center rounded-full bg-emerald-50 text-emerald-500">
                  <Check size={16} weight="bold" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-extrabold text-slate-700">
                    {bill.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Paid {bill.lastPaidAt ? formatDate(bill.lastPaidAt.slice(0, 10)) : ''} ·{' '}
                    {bill.frequency === 'once' ? 'one time' : bill.frequency}
                  </p>
                </div>
                <p className="text-[12px] font-extrabold text-slate-500">
                  {formatMoney(bill.amount, currency)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-[11px] leading-relaxed text-sky-800">
        <Receipt size={16} weight="duotone" className="mt-0.5 shrink-0" />
        Marking a bill paid creates an expense dated today. Monthly and weekly bills
        advance to their next due date; one-time bills are archived.
      </div>

      <BillFormSheet
        open={formOpen}
        onClose={closeForm}
        bill={editing}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
        loading={deleting}
        title="Delete this bill?"
        description={
          toDelete
            ? `${toDelete.title} will be removed. Past payments stay in your expenses.`
            : ''
        }
        confirmLabel="Delete bill"
      />
    </div>
  )
}

function BillCard({
  bill,
  days,
  currency,
  paying,
  onPay,
  onEdit,
  onDelete,
}: {
  bill: Bill
  days: number
  currency: CurrencyCode
  paying: boolean
  onPay: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const status =
    days < 0
      ? { label: 'Overdue', className: 'bg-rose-50 text-rose-600' }
      : days === 0
        ? { label: 'Due today', className: 'bg-amber-50 text-amber-700' }
        : days <= 7
          ? { label: 'Due soon', className: 'bg-amber-50 text-amber-700' }
          : { label: 'Upcoming', className: 'bg-sky-50 text-sky-700' }

  return (
    <article className="flex flex-col rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-sky-100">
      <div className="flex items-start gap-3">
        <CategoryIcon category={bill.category} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold tracking-tight text-slate-900">
            {bill.title}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {CATEGORY_MAP[bill.category]?.label} ·{' '}
            {BILL_FREQUENCIES.find((item) => item.id === bill.frequency)?.label}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold',
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
            Amount
          </p>
          <p className="mt-1 break-words text-lg font-extrabold tracking-tight text-slate-900">
            {formatMoney(bill.amount, currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
            Due
          </p>
          <p
            className={cn(
              'mt-1 text-[12px] font-extrabold',
              days < 0 ? 'text-rose-500' : 'text-slate-600',
            )}
          >
            {relativeDueLabel(bill.dueDate)}
          </p>
          <p className="text-[10px] text-slate-400">{formatDate(bill.dueDate)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t border-slate-50 pt-3">
        <Button
          size="sm"
          variant="soft"
          className="flex-1"
          loading={paying}
          onClick={onPay}
          leftIcon={<Check size={14} weight="bold" />}
        >
          Mark paid
        </Button>
        <button
          type="button"
          onClick={onEdit}
          className="grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"
          aria-label={`Edit ${bill.title}`}
        >
          <PencilSimple size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="grid size-9 place-items-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
          aria-label={`Delete ${bill.title}`}
        >
          <Trash size={16} />
        </button>
      </div>
    </article>
  )
}

function FilterButton({
  active,
  onClick,
  label,
  count,
  tone = 'sky',
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  tone?: 'sky' | 'rose' | 'amber'
}) {
  const activeTones = {
    sky: 'border-sky-500 bg-sky-600 text-white',
    rose: 'border-rose-500 bg-rose-500 text-white',
    amber: 'border-amber-500 bg-amber-500 text-white',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-extrabold transition',
        active
          ? activeTones[tone]
          : 'border-slate-200 bg-white text-slate-500 hover:border-sky-200 hover:text-sky-700',
      )}
    >
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

function BillFormSheet({
  open,
  onClose,
  bill,
}: {
  open: boolean
  onClose: () => void
  bill: Bill | null
}) {
  const { addBill, updateBill } = useFinance()
  const { profile } = useProfile()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [frequency, setFrequency] = useState<BillFrequency>('monthly')
  const [category, setCategory] = useState<CategoryId>('bills')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currency = profile?.currency ?? 'MMK'

  useEffect(() => {
    if (!open) return
    setError(null)
    if (bill) {
      setTitle(bill.title)
      setAmount(formatAmountInput(String(bill.amount)))
      setDueDate(bill.dueDate)
      setFrequency(bill.frequency)
      setCategory(bill.category)
    } else {
      setTitle('')
      setAmount('')
      setDueDate(format(new Date(), 'yyyy-MM-dd'))
      setFrequency('monthly')
      setCategory('bills')
    }
  }, [open, bill])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const value = parseAmount(amount)
    if (title.trim().length < 2) {
      setError('Give this bill a short, clear title.')
      return
    }
    if (value <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    if (!dueDate) {
      setError('Choose the next due date.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        amount: value,
        dueDate,
        frequency,
        category,
      }
      if (bill) {
        await updateBill(bill, payload)
        toast('Bill updated.', 'success')
      } else {
        await addBill(payload)
        toast('Bill added.', 'success')
      }
      onClose()
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Could not save that bill.'
      setError(message)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={bill ? 'Edit bill' : 'Add a bill'}
      description="A small reminder now saves a late fee later."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            form="bill-form"
            loading={loading}
            fullWidth
            className="sm:w-auto"
          >
            {bill ? 'Save changes' : 'Add bill'}
          </Button>
        </div>
      }
    >
      <form id="bill-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Bill title"
          placeholder="Apartment rent, Netflix, fiber internet…"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          icon={<CalendarBlank size={18} />}
        />

        <div>
          <label
            htmlFor="bill-amount"
            className="mb-2 block text-[13px] font-bold tracking-tight text-slate-700"
          >
            Amount
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
            <span className="text-xs font-extrabold text-sky-700">{currency}</span>
            <input
              id="bill-amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(formatAmountInput(event.target.value))}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-xl font-extrabold tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(CURRENCY_MAP[currency]?.quickAmounts ?? []).slice(0, 4).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(formatAmountInput(String(value)))}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-extrabold text-slate-500 transition hover:border-sky-300 hover:text-sky-700"
              >
                {new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(value)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Next due date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <SelectField
            label="Frequency"
            value={frequency}
            onChange={(value) => setFrequency(value as BillFrequency)}
            options={BILL_FREQUENCIES.map((item) => ({
              value: item.id,
              label: item.label,
            }))}
          />
        </div>

        <SelectField
          label="Category"
          value={category}
          onChange={(value) => setCategory(value as CategoryId)}
          options={CATEGORIES.map((item) => ({
            value: item.id,
            label: item.label,
          }))}
        />

        <div className="flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-[11px] leading-relaxed text-sky-800">
          <WarningCircle size={16} weight="duotone" className="mt-0.5 shrink-0" />
          One-time bills archive after payment. Monthly bills move one month ahead;
          weekly bills move one week ahead.
        </div>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
            {error}
          </p>
        )}
      </form>
    </Sheet>
  )
}
