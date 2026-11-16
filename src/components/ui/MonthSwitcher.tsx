import { addMonths, isSameMonth, startOfMonth } from 'date-fns'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { monthLabel } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MonthSwitcherProps {
  value: Date
  onChange: (date: Date) => void
  className?: string
  allowFuture?: boolean
}

export function MonthSwitcher({
  value,
  onChange,
  className,
  allowFuture = false,
}: MonthSwitcherProps) {
  const currentMonth = startOfMonth(new Date())
  const previous = addMonths(startOfMonth(value), -1)
  const next = addMonths(startOfMonth(value), 1)
  const nextDisabled = !allowFuture && next.getTime() > currentMonth.getTime()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(previous)}
        className="grid size-8 place-items-center rounded-full text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
        aria-label="Previous month"
      >
        <CaretLeft size={15} weight="bold" />
      </button>
      <span className="min-w-28 px-1 text-center text-xs font-extrabold tracking-tight text-slate-700 sm:text-[13px]">
        {monthLabel(value)}
      </span>
      <button
        type="button"
        disabled={nextDisabled}
        onClick={() => onChange(next)}
        className="grid size-8 place-items-center rounded-full text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 disabled:opacity-35 disabled:hover:bg-transparent"
        aria-label="Next month"
      >
        <CaretRight size={15} weight="bold" />
      </button>
    </div>
  )
}

export function isCurrentMonth(date: Date) {
  return isSameMonth(date, new Date())
}
