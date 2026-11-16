import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, Target, WarningCircle } from '@phosphor-icons/react'
import { isSameMonth, parseISO } from 'date-fns'
import { SetupShell } from '@/layouts/SetupShell'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { TargetArt } from '@/components/art/Illustrations'
import { useProfile } from '@/contexts/ProfileContext'
import { useFinance } from '@/contexts/FinanceContext'
import { useToast } from '@/contexts/ToastContext'
import {
  BUDGET_GROUP_IDS,
  BUDGET_GROUP_META,
  DEFAULT_ALLOCATIONS,
} from '@/lib/constants'
import { clamp, formatAmountInput, formatMoney, parseAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BudgetAllocations, BudgetGroupId } from '@/types'

export function SetupBudget() {
  const { profile, loading, saving, saveProfile } = useProfile()
  const { incomes } = useFinance()
  const [amount, setAmount] = useState('')
  const [allocations, setAllocations] = useState<BudgetAllocations>({
    ...DEFAULT_ALLOCATIONS,
  })
  const navigate = useNavigate()
  const toast = useToast()

  const currency = profile?.currency ?? 'MMK'
  const total = parseAmount(amount)
  const allocationTotal = useMemo(
    () => BUDGET_GROUP_IDS.reduce((sum, key) => sum + allocations[key], 0),
    [allocations],
  )
  const difference = 100 - allocationTotal
  const canSave = total > 0 && difference === 0
  const income = useMemo(
    () =>
      incomes
        .filter((income) => {
          const date = parseISO(income.date)
          return !Number.isNaN(date.getTime()) && isSameMonth(date, new Date())
        })
        .reduce((sum, income) => sum + income.amount, 0),
    [incomes],
  )

  useEffect(() => {
    if (!profile) return
    setAmount(
      profile.budget.total > 0
        ? formatAmountInput(String(profile.budget.total))
        : '',
    )
    setAllocations({ ...profile.budget.allocations })
  }, [profile])

  function updateAllocation(key: BudgetGroupId, value: number) {
    setAllocations((current) => ({
      ...current,
      [key]: clamp(Math.round(value), 0, 100),
    }))
  }

  function balanceTotal() {
    setAllocations((current) => {
      const next = { ...current }
      const diff = 100 - BUDGET_GROUP_IDS.reduce((sum, key) => sum + next[key], 0)
      next.other = clamp(next.other + diff, 0, 100)
      const remaining = 100 - BUDGET_GROUP_IDS.reduce((sum, key) => sum + next[key], 0)
      if (remaining !== 0) {
        next.food = clamp(next.food + remaining, 0, 100)
      }
      return next
    })
  }

  async function save() {
    if (!canSave) {
      toast(
        total <= 0
          ? 'Enter a monthly budget amount first.'
          : 'Your category percentages need to add up to 100%.',
        'error',
      )
      return
    }

    try {
      await saveProfile({
        budgetTotal: total,
        budgetAllocations: allocations,
      })
      toast('Budget saved.', 'success')
      navigate('/profile', { replace: true })
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not save your budget.',
        'error',
      )
    }
  }

  if (loading && !profile) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner size={30} />
      </div>
    )
  }

  return (
    <SetupShell
      variant="edit"
      eyebrow="Budget settings"
      title="Your monthly budget"
      subtitle="Give every kyat a job. Adjust your total and category split anytime."
      backTo="/profile"
      art={<TargetArt className="w-full" />}
      asideTitle="A budget is a plan, not a punishment."
      asideSubtitle="Start with your fixed bills and essentials, then decide what is left for shopping and fun. You can rebalance anytime."
      footer={
        <div className="space-y-2">
          <Button
            size="lg"
            fullWidth
            onClick={() => void save()}
            loading={saving}
            disabled={!canSave}
            rightIcon={<ArrowRight size={17} weight="bold" />}
          >
            Save budget
          </Button>
          <p className="text-center text-[11px] text-slate-400">
            Percentages must add up to 100% before saving.
          </p>
        </div>
      }
    >
      <div className="rounded-[24px] border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5">
        <label
          htmlFor="budget-total"
          className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-700"
        >
          <Target size={15} weight="duotone" />
          Total monthly budget
        </label>
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-sky-700 shadow-sm">
            {currency}
          </span>
          <input
            id="budget-total"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(formatAmountInput(event.target.value))}
            placeholder="0"
            className="min-w-0 flex-1 bg-transparent text-3xl font-extrabold tracking-[-0.04em] text-slate-900 outline-none placeholder:text-slate-300 sm:text-4xl"
          />
        </div>
        {income > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[50, 70, 100].map((percentage) => {
              const value = Math.round((income * percentage) / 100)
              return (
                <button
                  key={percentage}
                  type="button"
                  onClick={() => setAmount(formatAmountInput(String(value)))}
                  className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-extrabold text-sky-700 transition hover:bg-sky-100"
                >
                  {percentage}% of income
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
          Category split
        </p>
        <div className="flex items-center gap-2">
          {difference !== 0 && (
            <button
              type="button"
              onClick={balanceTotal}
              className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 transition hover:bg-amber-100"
            >
              Fix total
            </button>
          )}
          <button
            type="button"
            onClick={() => setAllocations({ ...DEFAULT_ALLOCATIONS })}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500 transition hover:bg-slate-200"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-4">
        {BUDGET_GROUP_IDS.map((key) => {
          const group = BUDGET_GROUP_META[key]
          const value = allocations[key]
          const money = Math.round((total * value) / 100)
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-[13px] font-extrabold text-slate-700">
                  {group.label}
                </span>
                <span className="ml-auto text-[11px] font-semibold text-slate-400">
                  {formatMoney(money, currency)}
                </span>
                <span className="w-11 rounded-lg bg-slate-100 py-0.5 text-center text-[11px] font-extrabold text-slate-700">
                  {value}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={(event) => updateAllocation(key, Number(event.target.value))}
                className="budget-range"
                style={{ '--p': `${value}%` } as CSSProperties}
                aria-label={`${group.label} budget percentage`}
              />
            </div>
          )
        })}
      </div>

      <div
        className={cn(
          'mt-5 flex items-center justify-between gap-3 rounded-2xl px-4 py-3',
          difference === 0
            ? 'bg-emerald-50 text-emerald-800'
            : 'bg-amber-50 text-amber-800',
        )}
      >
        <span className="flex items-center gap-2 text-[12px] font-extrabold">
          {difference === 0 ? (
            <CheckCircle size={17} weight="fill" />
          ) : (
            <WarningCircle size={17} weight="duotone" />
          )}
          {difference === 0
            ? 'Perfect — your split adds up to 100%'
            : `${Math.abs(difference)}% ${difference > 0 ? 'left to assign' : 'over the limit'}`}
        </span>
        <span className="text-sm font-extrabold">{allocationTotal}%</span>
      </div>

    </SetupShell>
  )
}
