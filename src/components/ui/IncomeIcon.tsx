import {
  Briefcase,
  DotsThreeCircle,
  Gift,
  Laptop,
  TrendUp,
  Wallet,
  type Icon,
} from '@phosphor-icons/react'
import { INCOME_SOURCE_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { IncomeSourceId } from '@/types'

const ICONS: Record<IncomeSourceId, Icon> = {
  salary: Wallet,
  freelance: Laptop,
  business: Briefcase,
  investment: TrendUp,
  gift: Gift,
  other: DotsThreeCircle,
}

interface IncomeIconProps {
  source: IncomeSourceId
  size?: 'sm' | 'md' | 'lg'
  shape?: 'round' | 'squircle'
  className?: string
}

const SIZES = {
  sm: { box: 'size-9', icon: 17 },
  md: { box: 'size-11', icon: 21 },
  lg: { box: 'size-14', icon: 26 },
}

export function IncomeIcon({
  source,
  size = 'md',
  shape = 'squircle',
  className,
}: IncomeIconProps) {
  const meta = INCOME_SOURCE_MAP[source] ?? INCOME_SOURCE_MAP.other
  const IconComponent = ICONS[source] ?? DotsThreeCircle
  const sizing = SIZES[size]
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center',
        shape === 'round' ? 'rounded-full' : 'rounded-2xl',
        sizing.box,
        className,
      )}
      style={{ backgroundColor: meta.soft, color: meta.color }}
      aria-hidden="true"
    >
      <IconComponent size={sizing.icon} weight="duotone" />
    </span>
  )
}
