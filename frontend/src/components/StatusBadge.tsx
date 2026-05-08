import { getStatusVariant, type StatusVariant } from '@/config/opsync'

interface StatusBadgeProps {
  status: string
  module?: string
  label?: string
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'ops-pill ops-pill-success',
  warning: 'ops-pill ops-pill-warning',
  danger: 'ops-pill ops-pill-danger',
  info: 'ops-pill ops-pill-info',
  neutral: 'ops-pill ops-pill-neutral',
}

const STATUS_DISPLAY_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
  processing: 'Processing',
  no_show: 'No Show',
  recommended: 'Recommended',
  dispatched: 'Dispatched',
  assigned: 'Assigned',
  supervisor_approved: 'Approved by Supervisor',
  finance_approved: 'Approved by Finance',
  paid: 'Paid',
  active: 'Active',
  inactive: 'Inactive',
  available: 'Available',
  on_trip: 'On Trip',
  maintenance: 'Under Maintenance',
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const variant = getStatusVariant(status)
  const displayLabel = label ?? STATUS_DISPLAY_LABELS[status] ?? status.replace(/_/g, ' ')

  return (
    <span className={VARIANT_CLASSES[variant]}>
      <span className="ops-dot" />
      {displayLabel}
    </span>
  )
}
