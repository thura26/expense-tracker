import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { CaretDown, Eye, EyeSlash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  rightSlot?: ReactNode
  error?: string
  hint?: string
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    icon,
    rightSlot,
    error,
    hint,
    className,
    containerClassName,
    id,
    ...props
  },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className={cn('min-w-0', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-[13px] font-bold tracking-tight text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            fieldBase,
            'h-12',
            icon ? 'pl-11' : 'pl-4',
            rightSlot ? 'pr-12' : 'pr-4',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
})

interface PasswordInputProps extends Omit<InputProps, 'rightSlot' | 'type'> {}

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, className, containerClassName, id, ...props },
    ref,
  ) {
    const autoId = useId()
    const textareaId = id ?? autoId
    return (
      <div className={cn('min-w-0', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-[13px] font-bold tracking-tight text-slate-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            fieldBase,
            'min-h-24 resize-none px-4 py-3',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    )
  },
)

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  icon?: ReactNode
  error?: string
  hint?: string
  className?: string
  disabled?: boolean
  name?: string
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  icon,
  error,
  hint,
  className,
  disabled,
  name,
}: SelectFieldProps) {
  const id = useId()
  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-[13px] font-bold tracking-tight text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <select
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            fieldBase,
            'h-12 appearance-none pr-10',
            icon ? 'pl-11' : 'pl-4',
            !value && 'text-slate-400',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CaretDown
          size={16}
          weight="bold"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}
