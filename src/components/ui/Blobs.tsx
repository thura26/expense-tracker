import { cn } from '@/lib/utils'

export function Blobs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className="absolute -left-20 -top-24 size-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="absolute -right-24 top-10 size-80 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="absolute bottom-[-8rem] left-1/3 size-72 rounded-full bg-sky-100/80 blur-3xl" />
      <div className="absolute right-1/4 top-1/2 size-2 rounded-full bg-sky-300/70" />
      <div className="absolute left-1/4 top-1/4 size-1.5 rounded-full bg-sky-400/60" />
      <div className="absolute right-10 top-1/3 size-1.5 rounded-full bg-cyan-400/60" />
    </div>
  )
}
