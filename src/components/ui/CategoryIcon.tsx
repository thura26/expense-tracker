import {
  Bus,
  DotsThreeCircle,
  ForkKnife,
  GameController,
  Gift,
  GraduationCap,
  Heartbeat,
  Receipt,
  ShoppingBag,
  type Icon,
} from '@phosphor-icons/react'
import { CATEGORY_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { CategoryId } from '@/types'

const ICONS: Record<CategoryId, Icon> = {
  food: ForkKnife,
  transport: Bus,
  shopping: ShoppingBag,
  health: Heartbeat,
  education: GraduationCap,
  entertainment: GameController,
  bills: Receipt,
  gifts: Gift,
  other: DotsThreeCircle,
}

interface CategoryIconProps {
  category: CategoryId
  size?: 'sm' | 'md' | 'lg'
  shape?: 'round' | 'squircle'
  className?: string
}

const SIZES = {
  sm: { box: 'size-9', icon: 17 },
  md: { box: 'size-11', icon: 21 },
  lg: { box: 'size-14', icon: 26 },
}

export function CategoryIcon({
  category,
  size = 'md',
  shape = 'squircle',
  className,
}: CategoryIconProps) {
  const meta = CATEGORY_MAP[category] ?? CATEGORY_MAP.other
  const IconComponent = ICONS[category] ?? DotsThreeCircle
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
