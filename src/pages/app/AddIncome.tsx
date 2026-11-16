import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownLeft,
  CalendarBlank,
  NotePencil,
  Wallet,
  X,
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { IncomeIcon } from '@/components/ui/IncomeIcon'
import { useFinance } from '@/contexts/FinanceContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'
import { friendlyAuthError } from '@/lib/authErrors'
import { CURRENCY_MAP, INCOME_SOURCES } from '@/lib/constants'
import { formatAmountInput, parseAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { IncomeSourceId } from '@/types'

export function AddIncome() {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState<IncomeSourceId>('salary')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const toast = useToast()
  const { addIncome } = useFinance()
  const { profile } = useProfile()

  const currency = profile?.currency ?? 'MMK'
  const quickAmounts = CURRENCY_MAP[currency]?.quickAmounts ?? []

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const value = parseAmount(amount)

    if (value <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    if (!date) {
      setError('Choose a date for this income.')
      return
    }

    setLoading(true)
    try {
      await addIncome({
        amount: value,
        source,
        date,
        note: note.trim() || undefined,
      })
      toast('Income added.', 'success')
      navigate('/income')
    } catch (submitError) {
      const message = friendlyAuthError(submitError)
      setError(message)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up pb-36 lg:pb-0">
      <PageHeader
        title="Add income"
        subtitle="Log money as it arrives. Every entry updates your balance and savings."
        backTo="/income"
        actions={
          <Link
            to="/expenses/new"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-extrabold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700 sm:inline-flex"
          >
            Add expense instead
          </Link>
        }
      />

      <form id="income-form" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="min-w-0 space-y-4 lg:col-span-7">
            <section className="rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-emerald-700">
                    Amount received
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    How much came in?
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-emerald-700 shadow-sm">
                  {currency}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-2xl font-extrabold text-emerald-600">
                  <ArrowDownLeft size={26} weight="bold" />
                </span>
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    setAmount(formatAmountInput(event.target.value))
                    setError(null)
                  }}
                  placeholder="0"
                  className="min-w-0 flex-1 bg-transparent text-[clamp(2rem,8vw,3.4rem)] font-extrabold leading-none tracking-[-0.05em] text-slate-900 outline-none placeholder:text-slate-300"
                  aria-label="Income amount"
                  autoFocus
                />
                {amount && (
                  <button
                    type="button"
                    onClick={() => setAmount('')}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-slate-400 shadow-sm transition hover:text-rose-500"
                    aria-label="Clear amount"
                  >
                    <X size={16} weight="bold" />
                  </button>
                )}
              </div>
              {quickAmounts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(formatAmountInput(String(value)))}
                      className="rounded-full border border-emerald-100 bg-white/80 px-3 py-1.5 text-[10px] font-extrabold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      {new Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(value)}
                    </button>
                  ))}
                </div>
              )}
              {error && (
                <p className="mt-3 text-[12px] font-semibold text-rose-600">{error}</p>
              )}
            </section>

            <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3">
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                  Income source
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Where did this money come from?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {INCOME_SOURCES.map((item) => {
                  const selected = source === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSource(item.id)}
                      className={cn(
                        'relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center transition',
                        selected
                          ? 'border-emerald-400 bg-emerald-50 shadow-[0_10px_24px_-18px_rgba(5,150,105,0.7)]'
                          : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40',
                      )}
                      aria-pressed={selected}
                    >
                      <IncomeIcon source={item.id} size="md" />
                      <span className="text-[11px] font-extrabold leading-tight text-slate-600">
                        {item.label}
                      </span>
                      {selected && (
                        <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-emerald-600 text-white">
                          <Wallet size={11} weight="bold" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-4 lg:col-span-5">
            <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-extrabold tracking-tight text-slate-900">
                Details
              </h2>
              <div className="space-y-4">
                <Input
                  label="Date received"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  icon={<CalendarBlank size={18} />}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
                <Textarea
                  label="Note"
                  placeholder="Monthly salary, freelance project, gift…"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={180}
                  hint={`${note.length}/180 characters`}
                />
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-[11px] leading-relaxed text-emerald-800">
                <NotePencil size={16} weight="duotone" className="mt-0.5 shrink-0" />
                Income is separate from your opening balance. Add each payment as it
                arrives so every month stays accurate.
              </div>
              <div className="mt-4 hidden lg:block">
                <Button type="submit" size="lg" fullWidth loading={loading}>
                  Add income
                </Button>
              </div>
            </section>
          </div>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-slate-100 bg-canvas/95 p-3 backdrop-blur-xl lg:hidden">
        <Button type="submit" form="income-form" size="lg" fullWidth loading={loading}>
          Add income
        </Button>
      </div>
    </div>
  )
}
