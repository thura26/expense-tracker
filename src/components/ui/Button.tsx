import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'soft'
  | 'ghost'
  | 'danger'
  | 'white'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-sky-600 text-white shadow-[0_12px_24px_-12px_rgba(2,132,199,0.75)] hover:bg-sky-700 active:bg-sky-800',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700',
  soft: 'bg-sky-100 text-sky-700 hover:bg-sky-200/80',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
  white: 'bg-white text-sky-700 hover:bg-sky-50 shadow-sm',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-3.5 text-xs',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-13 gap-2.5 px-6 text-[15px]',
}

export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
  className?: string,
) {
  return cn(
    'inline-flex select-none items-center justify-center rounded-full font-bold tracking-tight transition duration-200 disabled:pointer-events-none disabled:opacity-55',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles(variant, size, fullWidth, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <CircleNotch size={18} weight="bold" className="animate-spin-slow" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
