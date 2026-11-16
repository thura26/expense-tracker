import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  CalendarBlank,
  Camera,
  Check,
  CreditCard,
  ImageSquare,
  NotePencil,
  Receipt,
  X,
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, SelectField, Textarea } from '@/components/ui/Input'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { useFinance } from '@/contexts/FinanceContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'
import { friendlyAuthError } from '@/lib/authErrors'
import { CATEGORIES, CATEGORY_MAP, PAYMENT_METHODS } from '@/lib/constants'
import { formatAmountInput, parseAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CategoryId } from '@/types'

export function AddExpense() {
  const [params] = useSearchParams()
  const initialCategory = params.get('category')
  const validInitialCategory =
    initialCategory && initialCategory in CATEGORY_MAP
      ? (initialCategory as CategoryId)
      : 'food'

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<CategoryId>(validInitialCategory)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [note, setNote] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const galleryRef = useRef<HTMLInputElement | null>(null)
  const cameraRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const toast = useToast()
  const { addExpense } = useFinance()
  const { profile } = useProfile()

  const currency = profile?.currency ?? 'MMK'

  useEffect(() => {
    if (!receiptFile) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(receiptFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [receiptFile])

  function chooseFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Choose an image file for the receipt.', 'error')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast('Receipts must be 8MB or smaller.', 'error')
      return
    }
    setReceiptFile(file)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const value = parseAmount(amount)

    if (value <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    if (!date) {
      setError('Choose a date for this expense.')
      return
    }

    setLoading(true)
    try {
      await addExpense({
        amount: value,
        category,
        date,
        paymentMethod,
        note: note.trim() || undefined,
        receiptFile,
      })
      toast('Expense added.', 'success')
      navigate('/expenses')
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
        title="Add expense"
        subtitle="Log it while it is fresh. A note and a receipt make future you grateful."
        backTo="/expenses"
        actions={
          <Link
            to="/categories"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-extrabold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700 sm:inline-flex"
          >
            Browse categories
          </Link>
        }
      />

      <form id="expense-form" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="min-w-0 space-y-4 lg:col-span-7">
            <section className="rounded-[26px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-sky-700">
                    Amount
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    How much did you spend?
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-sky-700 shadow-sm">
                  {currency}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-2xl font-extrabold text-sky-600">=</span>
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    setAmount(formatAmountInput(event.target.value))
                    setError(null)
                  }}
                  placeholder="0"
                  className="min-w-0 flex-1 bg-transparent text-[clamp(2rem,8vw,3.4rem)] font-extrabold leading-none tracking-[-0.05em] text-slate-900 outline-none placeholder:text-slate-300"
                  aria-label="Expense amount"
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
              {error && (
                <p className="mt-3 text-[12px] font-semibold text-rose-600">{error}</p>
              )}
            </section>

            <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                    Category
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Pick the closest fit.
                  </p>
                </div>
                <Link
                  to="/categories"
                  className="text-[11px] font-extrabold text-sky-600 transition hover:text-sky-700"
                >
                  See all
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                {CATEGORIES.map((item) => {
                  const selected = category === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={cn(
                        'relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center transition',
                        selected
                          ? 'border-sky-400 bg-sky-50 shadow-[0_10px_24px_-18px_rgba(2,132,199,0.7)]'
                          : 'border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50/40',
                      )}
                      aria-pressed={selected}
                    >
                      <CategoryIcon category={item.id} size="md" />
                      <span className="text-[11px] font-extrabold leading-tight text-slate-600">
                        {item.label}
                      </span>
                      {selected && (
                        <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-sky-600 text-white">
                          <Check size={11} weight="bold" />
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
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  icon={<CalendarBlank size={18} />}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
                <SelectField
                  label="Payment method"
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  options={PAYMENT_METHODS.map((method) => ({
                    value: method,
                    label: method,
                  }))}
                  icon={<CreditCard size={18} />}
                />
                <Textarea
                  label="Note"
                  placeholder="Lunch with the team, taxi home, groceries…"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={180}
                  hint={`${note.length}/180 characters`}
                />
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
                  <Receipt size={18} weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                    Add receipt
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Optional · image up to 8MB
                  </p>
                </div>
              </div>

              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  chooseFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  chooseFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />

              {preview ? (
                <div className="relative overflow-hidden rounded-2xl border border-slate-100">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="max-h-56 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setReceiptFile(null)}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:text-rose-500"
                    aria-label="Remove receipt"
                  >
                    <X size={15} weight="bold" />
                  </button>
                  <p className="truncate bg-white px-3 py-2 text-[11px] font-semibold text-slate-500">
                    {receiptFile?.name}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-4 text-center">
                  <p className="text-[12px] font-semibold text-slate-500">
                    Snap a photo or pick one from your gallery.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white text-[11px] font-extrabold text-sky-700 shadow-sm transition hover:bg-sky-100"
                    >
                      <Camera size={16} weight="duotone" />
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white text-[11px] font-extrabold text-sky-700 shadow-sm transition hover:bg-sky-100"
                    >
                      <ImageSquare size={16} weight="duotone" />
                      Gallery
                    </button>
                  </div>
                </div>
              )}
            </section>

            <div className="hidden rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm lg:block">
              <div className="mb-4 flex items-start gap-2 rounded-2xl bg-sky-50 p-3 text-[11px] leading-relaxed text-sky-800">
                <NotePencil size={16} weight="duotone" className="mt-0.5 shrink-0" />
                Expenses are private to your account. Receipts are stored in a private
                bucket and opened with short-lived links.
              </div>
              <Button type="submit" size="lg" fullWidth loading={loading}>
                Add expense
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-slate-100 bg-canvas/95 p-3 backdrop-blur-xl lg:hidden">
        <Button type="submit" form="expense-form" size="lg" fullWidth loading={loading}>
          Add expense
        </Button>
      </div>
    </div>
  )
}
