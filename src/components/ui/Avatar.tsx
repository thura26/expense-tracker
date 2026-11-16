import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-20 text-xl',
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-sky-700 font-extrabold text-white ring-2 ring-white',
        SIZES[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name ? `${name}'s avatar` : 'User avatar'}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}
