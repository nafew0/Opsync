'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Clock3, Printer, XCircle } from 'lucide-react'

import MeetingBookingPreview from '@/views/meetings/MeetingBookingPreview'
import OpsPageHeader from '@/components/opsync/OpsPageHeader'
import StatusBadge from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  approveBooking,
  cancelBooking,
  fetchBookingDetail,
  markBookingNoShow,
  rejectBooking,
  type MeetingBookingDetail as MeetingBookingDetailRecord,
} from '@/services/meetings'

import { formatDateLabel, formatTimeLabel } from './meeting-helpers'

function getErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
  const detail = responseData?.detail
  if (typeof detail === 'string') {
    return detail
  }
  if (responseData && typeof responseData === 'object') {
    const firstValue = Object.values(responseData)[0]
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0])
    }
    if (typeof firstValue === 'string') {
      return firstValue
    }
  }
  return fallback
}

function formatDateTimeValue(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase())
}

function buildPreviewSigners(booking: MeetingBookingDetailRecord) {
  return [
    {
      label: 'Requester',
      name: booking.requester_name,
      designation: booking.requester_designation || 'Not provided',
      signed: true,
    },
    {
      label: 'Admin Officer',
      name: booking.reviewed_by_name || undefined,
      designation: booking.reviewed_by_designation || undefined,
      signed: Boolean(booking.reviewed_by_name),
    },
    {
      label: 'Approval Seal',
      signed: ['approved', 'rejected', 'no_show'].includes(booking.status),
    },
  ]
}

function BookingTimeline({ status }: { status: string }) {
  const finalStepLabel = {
    pending: 'Awaiting admin review',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled by requester',
    no_show: 'Marked as no-show',
  }[status] ?? 'Processing'

  const isFinalPositive = status === 'approved'
  const isFinalNeutral = status === 'pending'

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--ops-primary-100)] text-[color:var(--ops-primary)]">
          <Clock3 className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-foreground">Submitted</p>
          <p className="text-sm text-muted-foreground">
            Request entered the meeting workflow and reserved the selected slot.
          </p>
        </div>
      </div>

      <div className="ml-4 h-8 w-px bg-[color:var(--ops-ink-200)]" />

      <div className="flex items-start gap-3">
        <div
          className="mt-1 flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            background: isFinalPositive
              ? 'var(--ops-success-100)'
              : isFinalNeutral
                ? 'var(--ops-warning-100)'
                : 'var(--ops-danger-100)',
            color: isFinalPositive
              ? 'var(--ops-success)'
              : isFinalNeutral
                ? 'var(--ops-warning)'
                : 'var(--ops-danger)',
          }}
        >
          {isFinalPositive ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isFinalNeutral ? (
            <Clock3 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{finalStepLabel}</p>
          <p className="text-sm text-muted-foreground">
            {status === 'pending'
              ? 'Waiting for an admin officer to approve or reject the request.'
              : 'The booking now reflects the latest administrative decision.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function MeetingBookingDetail() {
  const params = useParams()
  const bookingId = params?.id as string | undefined
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['meeting-booking-detail', bookingId],
    queryFn: () => fetchBookingDetail(bookingId as string),
    enabled: !!bookingId,
  })

  const actionMutation = useMutation({
    mutationFn: async (payload: { action: 'approve' | 'reject' | 'cancel' | 'no_show'; comment?: string }) => {
      if (!bookingId) {
        throw new Error('Missing booking id.')
      }

      if (payload.action === 'approve') {
        return approveBooking(bookingId)
      }
      if (payload.action === 'reject') {
        return rejectBooking(bookingId, payload.comment ?? '')
      }
      if (payload.action === 'cancel') {
        return cancelBooking(bookingId)
      }
      return markBookingNoShow(bookingId)
    },
    onSuccess: async (_nextBooking, payload) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['meeting-booking-detail', bookingId] }),
        queryClient.invalidateQueries({ queryKey: ['meeting-slots'] }),
        queryClient.invalidateQueries({ queryKey: ['meeting-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['meeting-booking-dashboard-summary'] }),
      ])

      setRejectDialogOpen(false)
      setRejectComment('')

      const titleMap = {
        approve: 'Booking approved',
        reject: 'Booking rejected',
        cancel: 'Booking cancelled',
        no_show: 'Booking marked as no-show',
      } as const

      toast({
        title: titleMap[payload.action],
        description: 'BdREN OpsSync saved the latest booking status.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Action failed',
        description: getErrorMessage(
          error,
          'BdREN OpsSync could not update the booking right now.'
        ),
        variant: 'error',
        duration: 4500,
      })
    },
  })

  const loadErrorMessage = error
    ? getErrorMessage(error, 'BdREN OpsSync could not load this meeting booking right now.')
    : 'BdREN OpsSync could not load this meeting booking right now.'

  if (isLoading) {
    return (
      <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-muted-foreground">
        Loading meeting booking...
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-rose-600">
        {loadErrorMessage}
      </div>
    )
  }

  const isRequester = user?.id === booking.requester_id
  const canReview = Boolean(
    user?.is_superuser || ['admin_officer', 'am_dm', 'system_admin'].includes(user?.opsync_role ?? '')
  )
  const durationMinutes =
    (Number(formatTimeLabel(booking.end_time).slice(0, 2)) * 60 +
      Number(formatTimeLabel(booking.end_time).slice(3, 5))) -
    (Number(formatTimeLabel(booking.start_time).slice(0, 2)) * 60 +
      Number(formatTimeLabel(booking.start_time).slice(3, 5)))
  const durationLabel =
    durationMinutes % 60 === 0
      ? `${durationMinutes / 60}h`
      : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`

  return (
    <div className="ops-stack">
      <OpsPageHeader
        eyebrow="Module 4.1 · MTG"
        title={booking.reference_number}
        subtitle="Review the booking details, workflow status, and printable request record."
        actions={(
          <>
            <Button variant="outline" onClick={() => router.push('/meetings')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to calendar
            </Button>
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Printer className="mr-2 h-4 w-4" />
              Print preview
            </Button>
          </>
        )}
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="theme-panel rounded-[1.8rem] border-0">
          <CardHeader>
            <CardTitle>Booking status</CardTitle>
            <CardDescription>Current state and workflow path for this request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={booking.status} />
              <span className="text-sm text-muted-foreground">
                Submitted {formatDateTimeValue(booking.created_at)}
              </span>
            </div>
            <BookingTimeline status={booking.status} />

            {(isRequester && booking.status === 'pending') || canReview ? (
              <div className="space-y-3 rounded-[1.2rem] border border-[color:var(--ops-ink-200)] bg-[color:var(--ops-ink-50)] p-4">
                <p className="text-sm font-semibold text-foreground">Actions</p>
                <div className="flex flex-wrap gap-3">
                  {isRequester && booking.status === 'pending' ? (
                    <Button
                      variant="outline"
                      disabled={actionMutation.isPending}
                      onClick={() => actionMutation.mutate({ action: 'cancel' })}
                    >
                      Cancel booking
                    </Button>
                  ) : null}
                  {canReview && booking.status === 'pending' ? (
                    <>
                      <Button
                        disabled={actionMutation.isPending}
                        onClick={() => actionMutation.mutate({ action: 'approve' })}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        disabled={actionMutation.isPending}
                        onClick={() => setRejectDialogOpen(true)}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {canReview && booking.status === 'approved' ? (
                    <Button
                      variant="outline"
                      disabled={actionMutation.isPending}
                      onClick={() => actionMutation.mutate({ action: 'no_show' })}
                    >
                      Mark No-Show
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="theme-panel rounded-[1.8rem] border-0">
          <CardHeader>
            <CardTitle>A4 request preview</CardTitle>
            <CardDescription>Document-first preview of the current booking record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="overflow-x-auto">
              <div className="mx-auto min-w-[360px] max-w-[820px]">
                <MeetingBookingPreview
                  referenceNumber={booking.reference_number}
                  requesterName={booking.requester_name}
                  requesterDesignation={booking.requester_designation || 'Not provided'}
                  requesterDepartment={booking.requester_department_name || 'Not assigned'}
                  roomName={booking.room_name}
                  roomCapacity={booking.room_capacity}
                  dateLabel={formatDateLabel(booking.date)}
                  startTime={formatTimeLabel(booking.start_time)}
                  endTime={formatTimeLabel(booking.end_time)}
                  durationLabel={durationLabel}
                  title={booking.title}
                  description={booking.description}
                  attendeeCount={booking.attendee_count}
                  hasExternalAttendees={booking.has_external_attendees}
                  externalAttendeeNotes={booking.external_attendee_notes}
                  equipmentLabels={booking.equipment_requested_labels}
                  statusLabel={formatStatusLabel(booking.status)}
                  signers={buildPreviewSigners(booking)}
                />
              </div>
            </div>

            {booking.admin_comment ? (
              <div className="rounded-[1.4rem] border border-[color:var(--ops-accent-200)] bg-[color:var(--ops-accent-100)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ops-accent-700)]">
                  Admin review note
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--ops-ink-800)]">
                  {booking.admin_comment}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--ops-ink-500)]">
                  {booking.reviewed_by_name || 'Admin officer'}
                  {' · '}
                  {booking.reviewed_by_designation || 'Designation not provided'}
                  {booking.reviewed_at ? ` · ${formatDateTimeValue(booking.reviewed_at)}` : ''}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={(open) => !actionMutation.isPending && setRejectDialogOpen(open)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Reject booking</DialogTitle>
            <DialogDescription>
              Provide the admin comment that will be shown to the requester.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectComment}
            onChange={(event) => setRejectComment(event.target.value)}
            placeholder="State why the booking cannot proceed."
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={actionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => actionMutation.mutate({ action: 'reject', comment: rejectComment })}
              disabled={actionMutation.isPending || rejectComment.trim().length === 0}
            >
              Reject booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[min(1100px,96vw)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Print preview</DialogTitle>
            <DialogDescription>
              Use your browser print dialog to print or save the request as PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
            <div className="overflow-x-auto">
              <div className="mx-auto min-w-[360px] max-w-[820px]">
                <MeetingBookingPreview
                  referenceNumber={booking.reference_number}
                  requesterName={booking.requester_name}
                  requesterDesignation={booking.requester_designation || 'Not provided'}
                  requesterDepartment={booking.requester_department_name || 'Not assigned'}
                  roomName={booking.room_name}
                  roomCapacity={booking.room_capacity}
                  dateLabel={formatDateLabel(booking.date)}
                  startTime={formatTimeLabel(booking.start_time)}
                  endTime={formatTimeLabel(booking.end_time)}
                  durationLabel={durationLabel}
                  title={booking.title}
                  description={booking.description}
                  attendeeCount={booking.attendee_count}
                  hasExternalAttendees={booking.has_external_attendees}
                  externalAttendeeNotes={booking.external_attendee_notes}
                  equipmentLabels={booking.equipment_requested_labels}
                  statusLabel={formatStatusLabel(booking.status)}
                  adminComment={booking.admin_comment}
                  adminReviewerName={booking.reviewed_by_name}
                  adminReviewerDesignation={booking.reviewed_by_designation}
                  signers={buildPreviewSigners(booking)}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
