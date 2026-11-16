import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  CaretRight,
  ChartDonut,
  CheckCircle,
  CurrencyCircleDollar,
  EnvelopeSimple,
  Info,
  PencilSimple,
  Phone,
  ShieldCheck,
  SignOut,
  Target,
  UserCircle,
  Wallet,
} from '@phosphor-icons/react'
import { isSameMonth, parseISO } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useFinance } from '@/contexts/FinanceContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Sheet } from '@/components/ui/Sheet'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CURRENCY_MAP } from '@/lib/constants'
import { formatDate, formatMoney, percent } from '@/lib/format'

export function Profile() {
  const { user, signOut } = useAuth()
  const { profile, saveProfile, saving } = useProfile()
  const { expenses, incomes, bills } = useFinance()
  const toast = useToast()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(profile?.displayName ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [signingOut, setSigningOut] = useState(false)

  const currency = profile?.currency ?? 'MMK'
  const meta = CURRENCY_MAP[currency]

  const monthTotal = useMemo(
    () =>
      expenses
        .filter((expense) => {
          const date = parseISO(expense.date)
          return !Number.isNaN(date.getTime()) && isSameMonth(date, new Date())
        })
        .reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  )

  const activeBills = bills.filter((bill) => bill.active).length
  const budgetUsed = percent(monthTotal, profile?.budget.total ?? 0)

  const monthIncomes = useMemo(
    () =>
      incomes.filter((income) => {
        const date = parseISO(income.date)
        return !Number.isNaN(date.getTime()) && isSameMonth(date, new Date())
      }),
    [incomes],
  )
  const monthIncome = monthIncomes.reduce((sum, income) => sum + income.amount, 0)

  function openEdit() {
    setName(profile?.displayName ?? '')
    setPhone(profile?.phone ?? '')
    setEditOpen(true)
  }

  async function saveDetails(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2) {
      toast('Enter at least two characters for your name.', 'error')
      return
    }
    try {
      await saveProfile({ displayName: name.trim(), phone: phone.trim() })
      toast('Profile updated.', 'success')
      setEditOpen(false)
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not update your profile.',
        'error',
      )
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      toast('Signed out. See you soon!', 'info')
      navigate('/signin')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Profile"
        subtitle="Your account, money settings, and privacy in one place."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={openEdit}
            leftIcon={<PencilSimple size={14} />}
            className="hidden sm:inline-flex"
          >
            Edit details
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="min-w-0 space-y-4 lg:col-span-4">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 p-6 text-white shadow-lg">
            <div className="absolute -right-10 -top-12 size-40 rounded-full bg-white/10" />
            <div className="relative flex items-start gap-4">
              <Avatar
                name={profile?.displayName || user?.displayName}
                src={user?.photoURL}
                size="xl"
                className="ring-white/40"
              />
              <div className="min-w-0 pt-1">
                <p className="truncate text-lg font-extrabold tracking-tight">
                  {profile?.displayName || user?.displayName || 'MoneyTrack user'}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-sky-100/90">
                  {profile?.email || user?.email}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold text-sky-50">
                  <CheckCircle size={12} weight="fill" />
                  {profile?.setupComplete ? 'Setup complete' : 'Setup in progress'}
                </span>
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-white/15 pt-4 text-center">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-sky-100/70">
                  Income
                </p>
                <p className="mt-1 break-words text-[12px] font-extrabold leading-tight">
                  {formatMoney(monthIncome, currency)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-sky-100/70">
                  Spent
                </p>
                <p className="mt-1 break-words text-[12px] font-extrabold leading-tight">
                  {formatMoney(monthTotal, currency)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-sky-100/70">
                  Bills
                </p>
                <p className="mt-1 break-words text-[12px] font-extrabold leading-tight">
                  {activeBills} active
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-sky-100/70">
                  Budget
                </p>
                <p className="mt-1 break-words text-[12px] font-extrabold leading-tight">
                  {profile?.budget.total ? `${Math.round(budgetUsed)}%` : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                Budget health
              </h2>
              <Target size={18} weight="duotone" className="text-sky-500" />
            </div>
            {profile?.budget.total ? (
              <>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <p className="text-lg font-extrabold tracking-tight text-slate-900">
                    {formatMoney(monthTotal, currency)}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    of {formatMoney(profile.budget.total, currency)}
                  </p>
                </div>
                <ProgressBar
                  value={budgetUsed}
                  tone={budgetUsed >= 100 ? 'rose' : budgetUsed >= 80 ? 'amber' : 'sky'}
                  className="mt-2"
                />
                <p className="mt-2 text-[11px] text-slate-400">
                  {Math.round(budgetUsed)}% of this month’s budget used.
                </p>
              </>
            ) : (
              <div className="mt-3">
                <p className="text-[12px] leading-relaxed text-slate-500">
                  Set a monthly budget to see how much room is left.
                </p>
                <Link
                  to="/setup/budget"
                  className="mt-3 inline-flex h-9 items-center rounded-full bg-sky-50 px-4 text-[11px] font-extrabold text-sky-700 transition hover:bg-sky-100"
                >
                  Set budget
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={18} weight="duotone" />
              </span>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                Privacy
              </h2>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
              Your income, expenses, and bills are protected by row-level security.
              Receipts live in a private storage bucket and open through short-lived
              signed links.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700">
              <CheckCircle size={13} weight="fill" />
              Private by default
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-4 lg:col-span-8">
          <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                  Personal details
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  How you appear inside MoneyTrack
                </p>
              </div>
              <button
                type="button"
                onClick={openEdit}
                className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-[10px] font-extrabold text-sky-700 transition hover:bg-sky-100"
              >
                <PencilSimple size={12} />
                Edit
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              <InfoRow
                icon={<UserCircle size={18} weight="duotone" />}
                label="Full name"
                value={profile?.displayName || 'Not set'}
              />
              <InfoRow
                icon={<EnvelopeSimple size={18} weight="duotone" />}
                label="Email address"
                value={profile?.email || user?.email || 'Not set'}
                hint="Managed by your sign-in method"
              />
              <InfoRow
                icon={<Phone size={18} weight="duotone" />}
                label="Phone number"
                value={profile?.phone || 'Not set'}
              />
              <InfoRow
                icon={<Info size={18} weight="duotone" />}
                label="Member since"
                value={profile?.createdAt ? formatDate(profile.createdAt) : 'Today'}
              />
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-3 text-sm font-extrabold tracking-tight text-slate-900">
              Money settings
            </h2>
            <div className="space-y-2">
              <SettingLink
                to="/setup/currency?edit=1"
                icon={<CurrencyCircleDollar size={19} weight="duotone" />}
                tone="sky"
                title="Display currency"
                description={meta ? `${meta.flag} ${meta.code} · ${meta.label}` : currency}
              />
              <SettingLink
                to="/income"
                icon={<Wallet size={19} weight="duotone" />}
                tone="emerald"
                title="Income"
                description={
                  monthIncomes.length > 0
                    ? `${formatMoney(monthIncome, currency)} · ${monthIncomes.length} entr${monthIncomes.length === 1 ? 'y' : 'ies'}`
                    : 'No income recorded this month'
                }
              />
              <SettingLink
                to="/setup/budget"
                icon={<Target size={19} weight="duotone" />}
                tone="indigo"
                title="Monthly budget"
                description={
                  profile?.budget.total
                    ? formatMoney(profile.budget.total, currency)
                    : 'Not set yet'
                }
              />
              <SettingLink
                to="/categories"
                icon={<ChartDonut size={19} weight="duotone" />}
                tone="amber"
                title="Expense categories"
                description="Browse this month’s category totals"
              />
              <SettingLink
                to="/bills"
                icon={<Bell size={19} weight="duotone" />}
                tone="rose"
                title="Bills & reminders"
                description={`${activeBills} active bill${activeBills === 1 ? '' : 's'}`}
              />
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
              Account
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
              Signed in with {user?.email ?? 'your email'}. Signing out will not delete
              any of your data.
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              loading={signingOut}
              onClick={() => void handleSignOut()}
              leftIcon={<SignOut size={16} />}
            >
              Sign out
            </Button>
          </section>

          <p className="px-1 text-center text-[11px] leading-relaxed text-slate-400">
            MoneyTrack v1.0 · Built with React, Supabase, and a sky-blue theme.
          </p>
        </div>
      </div>

      <Sheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit personal details"
        description="Your email is managed by your sign-in provider and cannot be changed here."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setEditOpen(false)} fullWidth className="sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              form="profile-form"
              loading={saving}
              fullWidth
              className="sm:w-auto"
            >
              Save changes
            </Button>
          </div>
        }
      >
        <form id="profile-form" onSubmit={saveDetails} className="space-y-4" noValidate>
          <Input
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            icon={<UserCircle size={18} />}
            placeholder="Your name"
          />
          <Input
            label="Phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            icon={<Phone size={18} />}
            placeholder="+95 9 000 000 000"
            hint="Optional. Shown only on your profile."
          />
          <Input
            label="Email address"
            value={profile?.email || user?.email || ''}
            disabled
            icon={<EnvelopeSimple size={18} />}
            hint="Change your email from your auth provider settings."
          />
        </form>
      </Sheet>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-400">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="truncate text-[13px] font-extrabold text-slate-700">{value}</p>
        {hint && <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>}
      </div>
    </div>
  )
}

const TONES = {
  sky: 'bg-sky-50 text-sky-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-500',
}

function SettingLink({
  to,
  icon,
  tone,
  title,
  description,
}: {
  to: string
  icon: ReactNode
  tone: keyof typeof TONES
  title: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-sky-200 hover:bg-sky-50/40"
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-extrabold text-slate-800">{title}</p>
        <p className="truncate text-[11px] text-slate-400">{description}</p>
      </div>
      <CaretRight size={15} weight="bold" className="shrink-0 text-slate-300" />
    </Link>
  )
}
