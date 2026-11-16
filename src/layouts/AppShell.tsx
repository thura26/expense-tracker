import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  CalendarBlank,
  ChartDonut,
  House,
  Receipt,
  SignOut,
  User,
  Bell,
  Plus,
  WarningCircle,
} from '@phosphor-icons/react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useFinance } from '@/contexts/FinanceContext'
import { useToast } from '@/contexts/ToastContext'
import { Avatar } from '@/components/ui/Avatar'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { Logo } from '@/components/ui/Logo'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { formatMoney, relativeDueLabel } from '@/lib/format'
import { exitDemoMode, isDemoMode } from '@/lib/demo'
import { cn } from '@/lib/utils'
import type { Bill } from '@/types'

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/income', label: 'Income', icon: ArrowDownLeft },
  { to: '/bills', label: 'Bills', icon: CalendarBlank },
  { to: '/analytics', label: 'Analytics', icon: ChartDonut },
  { to: '/profile', label: 'Profile', icon: User },
]

function daysUntil(date: string) {
  const parsed = parseISO(date)
  if (Number.isNaN(parsed.getTime())) return Number.POSITIVE_INFINITY
  return differenceInCalendarDays(parsed, new Date())
}

export function AppShell() {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const { bills, markBillPaid, error, refresh } = useFinance()
  const toast = useToast()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

  const alerts = useMemo(() => {
    return bills
      .filter((bill) => bill.active)
      .map((bill) => ({ bill, days: daysUntil(bill.dueDate) }))
      .filter((item) => item.days <= 7)
      .sort((a, b) => a.days - b.days)
  }, [bills])

  const overdueCount = alerts.filter((item) => item.days < 0).length
  const badgeCount = alerts.filter((item) => item.days <= 3).length

  async function handleSignOut() {
    await signOut()
    toast('Signed out. See you soon!', 'info')
    navigate('/signin')
  }

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

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-8 pt-7">
        <Link to="/home" className="inline-flex" aria-label="MoneyTrack home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold tracking-tight transition',
                  isActive
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-xl transition',
                      isActive
                        ? 'bg-sky-600 text-white shadow-[0_8px_16px_-8px_rgba(2,132,199,0.9)]'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-white',
                    )}
                  >
                    <Icon size={19} weight={isActive ? 'fill' : 'duotone'} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-2 px-4 pb-4">
        <Link
          to="/expenses/new"
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 p-4 text-white shadow-[0_16px_30px_-16px_rgba(2,132,199,0.9)] transition hover:brightness-105"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-white/20">
            <Plus size={18} weight="bold" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold">Add expense</span>
            <span className="block text-[11px] text-sky-100">
              Log it while it is fresh
            </span>
          </span>
        </Link>
        <Link
          to="/income/new"
          className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-emerald-800 transition hover:bg-emerald-100/70"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
            <ArrowDownLeft size={18} weight="bold" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold">Add income</span>
            <span className="block text-[11px] text-emerald-600">
              Record money coming in
            </span>
          </span>
        </Link>
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <Avatar
            name={profile?.displayName || user?.displayName}
            src={user?.photoURL}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold tracking-tight text-slate-800">
              {profile?.displayName || user?.displayName || 'MoneyTrack user'}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {profile?.email || user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="grid size-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-rose-500"
            aria-label="Sign out"
          >
            <SignOut size={18} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto border-r border-slate-100 bg-white/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-20 hidden border-b border-slate-100/80 bg-canvas/85 px-8 py-3 backdrop-blur-xl lg:block">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Personal finance
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/income/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-4 text-xs font-extrabold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                <ArrowDownLeft size={14} weight="bold" />
                Add income
              </Link>
              <Link
                to="/expenses/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-sky-600 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-sky-700"
              >
                <Plus size={14} weight="bold" />
                Add expense
              </Link>
              <NotificationButton
                count={badgeCount}
                onClick={() => setNotificationsOpen(true)}
              />
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100/80 bg-canvas/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link to="/home" aria-label="MoneyTrack home">
            <Logo />
          </Link>
          <NotificationButton
            count={badgeCount}
            onClick={() => setNotificationsOpen(true)}
          />
        </div>

        <main className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-14 lg:pt-8">
          {error && (
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[11px] font-semibold text-rose-900">
              <WarningCircle
                size={16}
                weight="duotone"
                className="shrink-0 text-rose-500"
              />
              <span className="min-w-0 flex-1">Could not load your data: {error}</span>
              <button
                type="button"
                onClick={() => void refresh()}
                className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-rose-700 shadow-sm transition hover:bg-rose-100"
              >
                Retry
              </button>
            </div>
          )}
          {isDemoMode && (
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] font-semibold text-amber-900">
              <WarningCircle
                size={16}
                weight="duotone"
                className="shrink-0 text-amber-600"
              />
              <span className="min-w-0 flex-1">
                Demo preview — changes are saved only in this browser.
              </span>
              <button
                type="button"
                onClick={() => exitDemoMode()}
                className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-amber-800 shadow-sm transition hover:bg-amber-100"
              >
                Exit demo
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6 px-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-16 flex-col items-center justify-center gap-1 px-0.5 text-[9px] font-extrabold tracking-tight transition sm:text-[10px]',
                    isActive ? 'text-sky-700' : 'text-slate-400',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'grid size-9 place-items-center rounded-2xl transition',
                        isActive && 'bg-sky-100',
                      )}
                    >
                      <Icon size={21} weight={isActive ? 'fill' : 'duotone'} />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      <Sheet
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
        description={
          overdueCount > 0
            ? `${overdueCount} bill${overdueCount > 1 ? 's' : ''} need your attention.`
            : 'Bills due in the next 7 days show up here.'
        }
        footer={
          <Button
            fullWidth
            onClick={() => {
              setNotificationsOpen(false)
              navigate('/bills')
            }}
          >
            Manage bills
          </Button>
        }
      >
        {alerts.length === 0 ? (
          <div className="rounded-2xl bg-emerald-50 p-5 text-center">
            <p className="text-sm font-extrabold text-emerald-700">You are all caught up</p>
            <p className="mt-1 text-xs text-emerald-600">
              No bills due in the next 7 days.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map(({ bill, days }) => (
              <div
                key={bill.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
              >
                <CategoryIcon category={bill.category} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    {bill.title}
                  </p>
                  <p
                    className={cn(
                      'text-[11px] font-semibold',
                      days < 0 ? 'text-rose-500' : 'text-slate-400',
                    )}
                  >
                    {relativeDueLabel(bill.dueDate)} ·{' '}
                    {formatMoney(bill.amount, profile?.currency ?? 'MMK')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="soft"
                  loading={payingId === bill.id}
                  onClick={() => void handlePayBill(bill)}
                >
                  Mark paid
                </Button>
              </div>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  )
}

function NotificationButton({
  count,
  onClick,
}: {
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
      aria-label={`Notifications${count ? `, ${count} new` : ''}`}
    >
      <Bell size={19} weight="duotone" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold leading-4 text-white ring-2 ring-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
