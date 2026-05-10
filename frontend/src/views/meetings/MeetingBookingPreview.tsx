'use client'
import {
  A4Field,
  A4Frame,
  A4Grid,
  A4Section,
  type SignerConfig,
} from '@/components/FormPreviewPanel'

interface MeetingBookingPreviewProps {
  referenceNumber: string
  requesterName: string
  requesterDesignation: string
  requesterDepartment: string
  roomName: string
  roomCapacity: number
  dateLabel: string
  startTime: string
  endTime: string
  durationLabel: string
  title: string
  description: string
  attendeeCount: number
  hasExternalAttendees: boolean
  externalAttendeeNotes: string
  equipmentLabels: string[]
  statusLabel?: string
  adminComment?: string
  adminReviewerName?: string
  adminReviewerDesignation?: string
  signers?: SignerConfig[]
}

const DEFAULT_SIGNERS: SignerConfig[] = [
  { label: 'Requester', signed: true },
  { label: 'Admin Officer', signed: false },
  { label: 'Approval Seal', signed: false },
]

export default function MeetingBookingPreview({
  referenceNumber,
  requesterName,
  requesterDesignation,
  requesterDepartment,
  roomName,
  roomCapacity,
  dateLabel,
  startTime,
  endTime,
  durationLabel,
  title,
  description,
  attendeeCount,
  hasExternalAttendees,
  externalAttendeeNotes,
  equipmentLabels,
  statusLabel,
  adminComment,
  adminReviewerName,
  adminReviewerDesignation,
  signers,
}: MeetingBookingPreviewProps) {
  const resolvedSigners = (signers ?? DEFAULT_SIGNERS).map((signer, index) =>
    index === 0
      ? {
          ...signer,
          name: signer.name ?? requesterName,
          designation: signer.designation ?? requesterDesignation,
          signed: signer.signed ?? true,
        }
      : signer
  )

  return (
    <A4Frame
      title="Meeting Room Booking Request"
      refNumber={referenceNumber}
      signers={resolvedSigners}
    >
      <A4Section title="Requester">
        <A4Grid>
          <A4Field label="Name" value={requesterName} />
          <A4Field label="Designation" value={requesterDesignation} />
          <A4Field label="Department" value={requesterDepartment} />
          <A4Field label="Status" value={statusLabel ?? 'Draft'} />
        </A4Grid>
      </A4Section>

      <A4Section title="Booking">
        <A4Grid>
          <A4Field label="Meeting Title" value={title} span={2} />
          <A4Field label="Room" value={roomName} />
          <A4Field label="Capacity" value={`${roomCapacity} seats`} />
          <A4Field label="Date" value={dateLabel} />
          <A4Field label="Time" value={`${startTime} – ${endTime}`} />
          <A4Field label="Duration" value={durationLabel} />
          <A4Field label="Attendees" value={attendeeCount} />
          <A4Field
            label="External Guests"
            value={hasExternalAttendees ? 'Yes' : 'No'}
          />
          <A4Field
            label="Equipment"
            value={equipmentLabels.length > 0 ? equipmentLabels.join(', ') : '—'}
            span={2}
          />
        </A4Grid>
      </A4Section>

      <A4Section title="Description">
        <div style={{ fontSize: 10, lineHeight: 1.5, color: 'var(--ops-ink-700)' }}>
          {description || <span style={{ color: 'var(--ops-ink-300)', fontStyle: 'italic' }}>—</span>}
        </div>
      </A4Section>

      <A4Section title="Visitor Notes">
        <div style={{ fontSize: 10, lineHeight: 1.5, color: 'var(--ops-ink-700)' }}>
          {hasExternalAttendees
            ? externalAttendeeNotes || 'External attendees listed without extra notes.'
            : 'No external attendees.'}
        </div>
      </A4Section>

      {adminComment ? (
        <A4Section title="Admin Comment">
          <div style={{ fontSize: 10, lineHeight: 1.5, color: 'var(--ops-ink-700)' }}>{adminComment}</div>
          {adminReviewerName ? (
            <div style={{ marginTop: 6, fontSize: 8.5, color: 'var(--ops-ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {adminReviewerName}
              {adminReviewerDesignation ? ` · ${adminReviewerDesignation}` : ''}
            </div>
          ) : null}
        </A4Section>
      ) : null}
    </A4Frame>
  )
}
