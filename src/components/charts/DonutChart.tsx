import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DonutDatum {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutDatum[]
  children?: ReactNode
  className?: string
}

export function DonutChart({ data, children, className }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0)
  const radius = 62
  const circumference = 2 * Math.PI * radius
  const gap = data.length > 1 ? 3 : 0
  let cursor = 0

  return (
    <div className={cn('relative mx-auto aspect-square w-full max-w-[240px]', className)}>
      <svg
        viewBox="0 0 160 160"
        className="size-full -rotate-90"
        role="img"
        aria-label="Spending by category"
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="22"
        />
        {total > 0 &&
          data.map((item) => {
            const portion = Math.max(0, item.value) / total
            const length = Math.max(0, portion * circumference - gap)
            const offset = cursor
            cursor += portion * circumference
            if (portion <= 0) return null
            return (
              <circle
                key={item.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="22"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
              >
                <title>
                  {item.label}: {Math.round(portion * 100)}%
                </title>
              </circle>
            )
          })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">{children}</div>
      </div>
    </div>
  )
}
