import { cn } from '@/lib/utils'

export interface TrendDatum {
  label: string
  value: number
  current?: boolean
}

interface TrendChartProps {
  data: TrendDatum[]
  formatValue?: (value: number) => string
  className?: string
}

export function TrendChart({ data, formatValue, className }: TrendChartProps) {
  const width = 440
  const height = 190
  const padding = { top: 18, right: 8, bottom: 30, left: 8 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const max = Math.max(...data.map((item) => item.value), 1)
  const slot = chartWidth / Math.max(data.length, 1)
  const barWidth = Math.min(38, slot * 0.46)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-auto w-full', className)}
      role="img"
      aria-label="Six month spending trend"
    >
      <defs>
        <linearGradient id="trend-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="trend-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BAE6FD" />
          <stop offset="1" stopColor="#7DD3FC" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((ratio) => {
        const y = padding.top + chartHeight * ratio
        return (
          <line
            key={ratio}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray={ratio === 1 ? '0' : '4 6'}
          />
        )
      })}

      {data.map((item, index) => {
        const ratio = Math.max(0.02, item.value / max)
        const barHeight = chartHeight * ratio
        const x = padding.left + slot * index + (slot - barWidth) / 2
        const y = padding.top + chartHeight - barHeight
        return (
          <g key={`${item.label}-${index}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={Math.min(12, barWidth / 2)}
              fill={item.current ? 'url(#trend-sky)' : 'url(#trend-soft)'}
              className="animate-bar-grow"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <title>
                {item.label}: {formatValue ? formatValue(item.value) : item.value}
              </title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={height - 9}
              textAnchor="middle"
              fontSize="11"
              fontWeight={item.current ? 800 : 600}
              fill={item.current ? '#0369A1' : '#94A3B8'}
            >
              {item.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
