'use client'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, LoaderCircle, MonitorPlay, Presentation, Speaker, Video, Clipboard } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  createBooking,
  MEETING_ROOM_EQUIPMENT_OPTIONS,
  type MeetingBookingDetail,
  type MeetingRoom,
  type MeetingRoomEquipmentValue,
} from '@/services/meetings'

import MeetingBookingPreview from './MeetingBookingPreview'

const EQUIPMENT_ICON_MAP = {
  projector: Presentation,
  whiteboard: Clipboard,
  video_conferencing: Video,
  screen: MonitorPlay,
  sound_system: Speaker,
} as const

interface MeetingBookingFormProps {
  room: MeetingRoom
  selection: {
    dateIso: string
    dateLabel: string
    startTime: string
    endTime: string
    durationLabel: string
  }
  onClose: () => void
  onBooked: (booking: MeetingBookingDetail) => void
}

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

export default function MeetingBookingForm({
  room,
  selection,
  onClose,
  onBooked,
}: MeetingBookingFormProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attendeeCount, setAttendeeCount] = useState('1')
  const [hasExternalAttendees, setHasExternalAttendees] = useState(false)
  const [externalAttendeeNotes, setExternalAttendeeNotes] = useState('')
  const [equipmentRequested, setEquipmentRequested] = useState<MeetingRoomEquipmentValue[]>([])

  const bookingMutation = useMutation({
    mutationFn: () =>
      createBooking({
        room: room.id,
        date: selection.dateIso,
        start_time: selection.startTime,
        end_time: selection.endTime,
        title: title.trim(),
        description: description.trim(),
        attendee_count: Number(attendeeCount),
        has_external_attendees: hasExternalAttendees,
        external_attendee_notes: externalAttendeeNotes.trim(),
        equipment_requested: equipmentRequested,
      }),
    onSuccess: async (booking) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['meeting-slots'] }),
        queryClient.invalidateQueries({ queryKey: ['meeting-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['meeting-booking-dashboard-summary'] }),
      ])
      toast({
        title: 'Booking submitted',
        description: `${booking.reference_number} is now awaiting admin review.`,
        variant: 'success',
      })
      onBooked(booking)
    },
    onError: (error) => {
      toast({
        title: 'Could not submit booking',
        description: getErrorMessage(
          error,
          'BdREN OpsSync could not submit the booking right now.'
        ),
        variant: 'error',
        duration: 4500,
      })
    },
  })

  const toggleEquipment = (value: MeetingRoomEquipmentValue) => {
    setEquipmentRequested((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  const titleLength = title.trim().length
  const isValid = titleLength > 0 && Number(attendeeCount) > 0
  const requesterName =
    user?.first_name || user?.last_name
      ? `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()
      : user?.username ?? 'Requester'

  return (
    <Dialog open onOpenChange={(open) => !bookingMutation.isPending && !open && onClose()}>
      <DialogContent className="left-auto right-0 top-0 h-screen w-full max-w-[min(92rem,100vw)] translate-x-0 translate-y-0 overflow-y-auto rounded-none border-l border-[color:var(--ops-ink-200)] p-0">
        <div className="grid min-h-full gap-0 xl:grid-cols-[minmax(0,0.94fr)_minmax(360px,1.06fr)]">
          <div className="border-b border-[color:var(--ops-ink-100)] bg-white xl:border-b-0 xl:border-r xl:border-[color:var(--ops-ink-100)]">
            <DialogHeader className="border-b border-[color:var(--ops-ink-100)] px-6 py-5">
              <DialogTitle>Book this slot</DialogTitle>
              <DialogDescription>
                Submit the meeting request for {room.name} on {selection.dateLabel}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-6 py-6">
              <section className="rounded-[1.2rem] border border-[color:var(--ops-ink-200)] bg-[color:var(--ops-ink-50)] p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Room</p>
                    <p className="mt-1 font-medium text-foreground">{room.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Time</p>
                    <p className="mt-1 font-medium text-foreground">
                      {selection.startTime} - {selection.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Date</p>
                    <p className="mt-1 text-foreground">{selection.dateLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Duration</p>
                    <p className="mt-1 text-foreground">{selection.durationLabel}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Requester</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Auto-filled from your BdREN OpsSync profile.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input value={requesterName} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label>Designation</Label>
                    <Input value={user?.designation || 'Not provided'} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <Input value={user?.department_name || 'Not assigned'} readOnly />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Meeting details</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    These values appear in the booking record and document preview.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="meeting-title">Meeting title</Label>
                  <Input
                    id="meeting-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={100}
                    placeholder="Network design review"
                  />
                  <p className="text-xs text-muted-foreground">{titleLength}/100 characters</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="attendee-count">Attendee count</Label>
                    <Input
                      id="attendee-count"
                      type="number"
                      min={1}
                      value={attendeeCount}
                      onChange={(event) => setAttendeeCount(event.target.value)}
                    />
                    {Number(attendeeCount) > room.capacity ? (
                      <p className="text-xs text-[color:var(--ops-accent-700)]">
                        This exceeds the configured room capacity of {room.capacity} seats. The request is still allowed.
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-[1rem] border border-[color:var(--ops-ink-200)] bg-[color:var(--ops-ink-50)] px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">External attendees</p>
                        <p className="text-xs text-muted-foreground">
                          Toggle on if guests from outside BdREN will join.
                        </p>
                      </div>
                      <Switch
                        checked={hasExternalAttendees}
                        onCheckedChange={setHasExternalAttendees}
                      />
                    </div>
                  </div>
                </div>
                {hasExternalAttendees ? (
                  <div className="grid gap-2">
                    <Label htmlFor="external-attendee-notes">External attendee notes</Label>
                    <Textarea
                      id="external-attendee-notes"
                      value={externalAttendeeNotes}
                      onChange={(event) => setExternalAttendeeNotes(event.target.value)}
                      placeholder="Guest names, organization, or access notes."
                      className="min-h-[88px]"
                    />
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <Label htmlFor="meeting-description">Description</Label>
                  <Textarea
                    id="meeting-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Agenda, purpose, or other context for approvers."
                    className="min-h-[110px]"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Equipment</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Request any additional room setup needed for the meeting.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {MEETING_ROOM_EQUIPMENT_OPTIONS.map((option) => {
                    const Icon = EQUIPMENT_ICON_MAP[option.value]
                    const selected = equipmentRequested.includes(option.value)
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-[1rem] border px-4 py-3 transition',
                          selected
                            ? 'border-[color:var(--ops-primary-200)] bg-[color:var(--ops-primary-50)] text-[color:var(--ops-primary)]'
                            : 'border-[color:var(--ops-ink-200)] bg-white text-[color:var(--ops-ink-700)] hover:bg-[color:var(--ops-ink-50)]'
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected}
                          onChange={() => toggleEquipment(option.value)}
                        />
                        <span
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-[0.9rem] border',
                            selected
                              ? 'border-[color:var(--ops-primary-200)] bg-white'
                              : 'border-[color:var(--ops-ink-200)] bg-[color:var(--ops-ink-50)]'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-sm font-medium">{option.label}</span>
                        {selected ? <Check className="h-4 w-4" /> : null}
                      </label>
                    )
                  })}
                </div>
              </section>

              <div className="flex flex-wrap justify-end gap-3 border-t border-[color:var(--ops-ink-100)] pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={bookingMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => bookingMutation.mutate()}
                  disabled={!isValid || bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Submit booking
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--ops-paper)] px-4 py-5 sm:px-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Live preview</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This document view updates as you shape the request.
              </p>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[360px]">
                <MeetingBookingPreview
                  referenceNumber="BDREN-MTG-PENDING"
                  requesterName={requesterName}
                  requesterDesignation={user?.designation || 'Not provided'}
                  requesterDepartment={user?.department_name || 'Not assigned'}
                  roomName={room.name}
                  roomCapacity={room.capacity}
                  dateLabel={selection.dateLabel}
                  startTime={selection.startTime}
                  endTime={selection.endTime}
                  durationLabel={selection.durationLabel}
                  title={title || 'Untitled meeting'}
                  description={description}
                  attendeeCount={Number(attendeeCount) || 0}
                  hasExternalAttendees={hasExternalAttendees}
                  externalAttendeeNotes={externalAttendeeNotes}
                  equipmentLabels={equipmentRequested.map(
                    (value) =>
                      MEETING_ROOM_EQUIPMENT_OPTIONS.find((option) => option.value === value)?.label ??
                      value
                  )}
                  statusLabel="Draft"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
