import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Plus, WarningCircle } from '@phosphor-icons/react'
import { SetupShell } from '@/layouts/SetupShell'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { Spinner } from '@/components/ui/Spinner'
import { CoinsArt } from '@/components/art/Illustrations'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/contexts/ToastContext'
import { CURRENCIES, MORE_CURRENCIES, PRIMARY_CURRENCIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { CurrencyCode, CurrencyMeta } from '@/types'

export function SetupCurrency() {
  const { profile, loading, saving, saveProfile } = useProfile()
  const [params] = useSearchParams()
  const isEdit = params.get('edit') === '1'
  const [selected, setSelected] = useState<CurrencyCode>('MMK')
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (profile?.currency) setSelected(profile.currency)
  }, [profile?.currency])

  async function handleNext() {
    try {
      await saveProfile({
        currency: selected,
        ...(isEdit ? {} : { setupComplete: true }),
      })
      toast(`${selected} is now your display currency.`, 'success')
      navigate(isEdit ? '/profile' : '/home', { replace: !isEdit })
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Could not save your currency.',
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

  const selectedMeta = CURRENCIES.find((currency) => currency.code === selected)

  return (
    <SetupShell
      step={1}
      variant={isEdit ? 'edit' : 'setup'}
      eyebrow={isEdit ? 'Currency settings' : undefined}
      title="Choose your currency"
      subtitle="This is how every amount will look across the app. Add income and expenses right after this."
      backTo={isEdit ? '/profile' : undefined}
      art={<CoinsArt className="w-full" />}
      asideTitle="Pick the currency you think in."
      asideSubtitle="MoneyTrack never converts amounts silently. If you switch currencies later, the numbers stay the same and the label changes. Income and budgets are optional and can be added anytime."
      footer={
        <div className="space-y-2">
          <Button
            size="lg"
            fullWidth
            onClick={() => void handleNext()}
            loading={saving}
            rightIcon={<ArrowRight size={17} weight="bold" />}
          >
            {isEdit ? 'Save currency' : 'Continue'}
          </Button>
          <p className="text-center text-[11px] text-slate-400">
            Selected: {selectedMeta?.flag} {selectedMeta?.label ?? selected}
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {PRIMARY_CURRENCIES.map((currency) => (
          <CurrencyCard
            key={currency.code}
            currency={currency}
            selected={selected === currency.code}
            onSelect={() => setSelected(currency.code)}
          />
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex min-h-[92px] items-center gap-2.5 rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-left transition hover:border-sky-300 hover:bg-sky-50/60 sm:gap-3 sm:p-3.5',
            !CURRENCIES.find((currency) => currency.code === selected)?.primary &&
              'border-sky-300 bg-sky-50/50',
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 sm:size-10">
            <Plus size={18} weight="bold" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-extrabold leading-tight text-slate-800">
              Other currency
            </span>
            <span className="mt-0.5 block text-[10px] leading-tight text-slate-400 sm:text-[11px]">
              <span className="hidden sm:inline">EGP, SAR, GBP, JPY and more</span>
              <span className="sm:hidden">7 more</span>
            </span>
          </span>
        </button>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-[12px] leading-relaxed text-sky-800">
        <WarningCircle size={17} weight="duotone" className="mt-0.5 shrink-0" />
        Switching currency does not convert your saved amounts. It only changes the
        label shown.
      </div>

      <Sheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More currencies"
        description="Choose any of these and it becomes your display currency."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {MORE_CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              type="button"
              onClick={() => {
                setSelected(currency.code)
                setMoreOpen(false)
              }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-3 text-left transition',
                selected === currency.code
                  ? 'border-sky-400 bg-sky-50'
                  : 'border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50/50',
              )}
            >
              <span className="text-2xl leading-none">{currency.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold text-slate-800">
                  {currency.code}
                </span>
                <span className="block truncate text-[11px] text-slate-400">
                  {currency.label}
                </span>
              </span>
              {selected === currency.code && (
                <span className="grid size-6 place-items-center rounded-full bg-sky-600 text-white">
                  <Check size={13} weight="bold" />
                </span>
              )}
            </button>
          ))}
        </div>
      </Sheet>
    </SetupShell>
  )
}

function CurrencyCard({
  currency,
  selected,
  onSelect,
}: {
  currency: CurrencyMeta
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex min-h-[92px] items-center gap-2.5 rounded-2xl border p-3 text-left transition sm:gap-3 sm:p-3.5',
        selected
          ? 'border-sky-400 bg-sky-50 shadow-[0_12px_26px_-18px_rgba(2,132,199,0.7)]'
          : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/50',
      )}
      aria-pressed={selected}
    >
      <span className="text-xl leading-none sm:text-2xl">{currency.flag}</span>
      <span className="min-w-0">
        <span className="block text-[12px] font-extrabold text-slate-900 sm:text-[13px]">
          {currency.code}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-slate-400 sm:text-[11px]">
          {currency.label}
        </span>
      </span>
      <span
        className={cn(
          'absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full border transition',
          selected
            ? 'border-sky-600 bg-sky-600 text-white'
            : 'border-slate-200 bg-white text-transparent',
        )}
      >
        <Check size={11} weight="bold" />
      </span>
    </button>
  )
}
