import { format, isValid, parseISO } from 'date-fns'
import type { CurrencyCode } from '@/types'
import { CURRENCY_MAP } from './constants'

export function formatMoney(amount: number, currency: CurrencyCode) {
  const meta = CURRENCY_MAP[currency]
  const decimals = meta?.decimals ?? 2
  const value = Number.isFinite(amount) ? amount : 0
  return `${currency} ${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function formatCompactMoney(amount: number, currency: CurrencyCode) {
  const value = Number.isFinite(amount) ? amount : 0
  return `${currency} ${value.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })}`
}

export function formatAmountInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  const normalizedWhole = Number(whole || 0).toLocaleString('en-US')
  if (rest.length === 0) return normalizedWhole
  return `${normalizedWhole}.${rest.join('').slice(0, 2)}`
}

export function parseAmount(value: string) {
  const parsed = Number(value.replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy') {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return isValid(parsed) ? format(parsed, pattern) : '—'
}

export function monthKey(date: Date | string) {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return format(parsed, 'yyyy-MM')
}

export function monthLabel(date: Date) {
  return format(date, 'MMMM yyyy')
}

export function percent(value: number, total: number) {
  if (!total || total <= 0) return 0
  return Math.min(100, Math.max(0, (value / total) * 100))
}

export function getInitials(name?: string | null) {
  if (!name) return 'M'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'M'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return `${first}${last}`.toUpperCase()
}

export function firstName(name?: string | null, email?: string | null) {
  if (name?.trim()) return name.trim().split(/\s+/)[0]
  if (email?.includes('@')) return email.split('@')[0]
  return 'there'
}

export function relativeDueLabel(dueDate: string) {
  const date = parseISO(dueDate)
  if (!isValid(date)) return '—'
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((target.getTime() - start.getTime()) / 86_400_000)
  if (diff < -1) return `Overdue by ${Math.abs(diff)} days`
  if (diff === -1) return 'Overdue by 1 day'
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  if (diff <= 7) return `Due in ${diff} days`
  return formatDate(date)
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function safeNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}
