import { Button } from './Button'
import { Sheet } from './Sheet'
import { WarningCircle } from '@phosphor-icons/react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  tone?: 'danger' | 'primary'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  loading = false,
  tone = 'danger',
}: ConfirmDialogProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">
            Cancel
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            fullWidth
            className="sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 rounded-2xl bg-rose-50/70 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-rose-500 shadow-sm">
          <WarningCircle size={22} weight="duotone" />
        </span>
        <p className="pt-1 text-[13px] leading-relaxed text-slate-600">{description}</p>
      </div>
    </Sheet>
  )
}
