'use client'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, CalendarRange, Check, Clock3, Layers3 } from 'lucide-react'

import OpsPageHeader from '@/components/opsync/OpsPageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  DEFAULT_MEETING_ROOM_NAME,
  fetchMeetingRooms,
  fetchMeetingSlots,
  type MeetingSlot,
} from '@/services/meetings'

import MeetingBookingForm from './MeetingBookingForm'
import {
  addDays,
  getDefaultMeetingFocusDate,
  getDefaultMeetingWeekStart,
  formatDateLabel,
  getEndSlotIndexExclusive,
  getMeetingRangeSummary,
  getMeetingWeekDays,
  getSlotIndexForTime,
  isMeetingWorkday,
  isWithinMeetingBookingWindow,
  isPastMeetingSlot,
  MEETING_SLOT_TIMES,
  parseIsoDate,
  toIsoDate,
  truncateLabel,
} from './meeting-helpers'

type ViewMode = 'week' | 'day'

interface SlotSelection {
  dateIso: string
  startSlotIndex: number
  endSlotIndexExclusive: number
}

const USER_COLORS = [
  '#f43f5e',
  '#3b82f6',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#ec4899',
  '#14b8a6',
]

function getOccupancyStatus(slot: MeetingSlot) {
  return slot.status === 'approved' ? 'booked' : 'reserved'
}

function getRangeLabel(selection: SlotSelection) {
  return getMeetingRangeSummary(
    parseIsoDate(selection.dateIso),
    selection.startSlotIndex,
    selection.endSlotIndexExclusive
  )
}

export default function MeetingCalendarPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [weekStart, setWeekStart] = useState(() => getDefaultMeetingWeekStart(new Date()))
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [activeDayIso, setActiveDayIso] = useState(() => toIsoDate(getDefaultMeetingFocusDate(new Date())))
  const [selection, setSelection] = useState<SlotSelection | null>(null)
  const [dragStart, setDragStart] = useState<SlotSelection | null>(null)
  const [formSelection, setFormSelection] = useState<SlotSelection | null>(null)

  const { data: rooms = [], isLoading: roomsLoading, error: roomsError } = useQuery({
    queryKey: ['meeting-rooms'],
    queryFn: fetchMeetingRooms,
  })

  const weekDays = useMemo(() => getMeetingWeekDays(weekStart), [weekStart])
  const resolvedRoomId =
    rooms.some((room) => room.id === selectedRoomId) ? selectedRoomId : rooms[0]?.id ?? ''
  const resolvedActiveDayIso = weekDays.some((day) => toIsoDate(day) === activeDayIso)
    ? activeDayIso
    : toIsoDate(weekDays[0])
  const selectedRoom = rooms.find((room) => room.id === resolvedRoomId) ?? null
  const lastWeekDay = weekDays[weekDays.length - 1]

  const { data: slots = [], isLoading: slotsLoading, error: slotsError } = useQuery({
    queryKey: ['meeting-slots', resolvedRoomId, toIsoDate(weekDays[0]), toIsoDate(lastWeekDay)],
    queryFn: () =>
      fetchMeetingSlots({
        room_id: resolvedRoomId,
        date_from: toIsoDate(weekDays[0]),
        date_to: toIsoDate(lastWeekDay),
      }),
    enabled: !!resolvedRoomId,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!dragStart) {
      return
    }

    const handleMouseUp = () => {
      setDragStart(null)
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [dragStart])

  const slotBookings = useMemo(() => {
    const cells = new Map<
      string,
      {
        booking: MeetingSlot
        status: 'reserved' | 'booked'
        titleLabel: string
        requesterLabel: string
      }
    >()

    slots.forEach((booking) => {
      const startSlotIndex = getSlotIndexForTime(booking.start_time)
      const endSlotIndexExclusive = getEndSlotIndexExclusive(booking.end_time)
      if (startSlotIndex < 0 || endSlotIndexExclusive <= startSlotIndex) {
        return
      }

      for (let slotIndex = startSlotIndex; slotIndex < endSlotIndexExclusive; slotIndex += 1) {
        cells.set(`${booking.date}:${slotIndex}`, {
          booking,
          status: getOccupancyStatus(booking),
          titleLabel: truncateLabel(booking.title || 'Reserved', 22),
          requesterLabel: truncateLabel(booking.requester_name || 'BdREN requester', 26),
        })
      }
    })

    return cells
  }, [slots])

  const userColorMap = useMemo(() => {
    const map = new Map<string, string>()
    let colorIndex = 0
    slots.forEach((slot) => {
      const name = slot.requester_name
      if (name && !map.has(name)) {
        map.set(name, USER_COLORS[colorIndex % USER_COLORS.length])
        colorIndex += 1
      }
    })
    return map
  }, [slots])

  const visibleDays = viewMode === 'day'
    ? [parseIsoDate(resolvedActiveDayIso)]
    : weekDays

  const rangeSummary = selection ? getRangeLabel(selection) : null
  const today = new Date()
  const nowMinutes = today.getHours() * 60 + today.getMinutes()
  const nowLineVisible =
    visibleDays.some((day) => toIsoDate(day) === toIsoDate(today)) &&
    nowMinutes >= 9 * 60 &&
    nowMinutes <= 17 * 60
  const nowLineTop = nowLineVisible
    ? 58 + ((nowMinutes - 9 * 60) / 30) * 40
    : 0

  const isSlotAvailable = (date: Date, slotIndex: number) => {
    const dateIso = toIsoDate(date)
    if (slotBookings.has(`${dateIso}:${slotIndex}`)) {
      return false
    }
    if (!isMeetingWorkday(date)) {
      return false
    }
    if (!isWithinMeetingBookingWindow(date)) {
      return false
    }
    if (isPastMeetingSlot(date, slotIndex)) {
      return false
    }
    return true
  }

  const isRangeAvailable = (
    dateIso: string,
    startSlotIndex: number,
    endSlotIndexExclusive: number
  ) => {
    const date = parseIsoDate(dateIso)
    for (let slotIndex = startSlotIndex; slotIndex < endSlotIndexExclusive; slotIndex += 1) {
      if (!isSlotAvailable(date, slotIndex)) {
        return false
      }
    }
    return true
  }

  const handleCellMouseDown = (dateIso: string, slotIndex: number) => {
    // Clicking a selected cell deselects everything (req 6 + 8)
    if (
      selection &&
      selection.dateIso === dateIso &&
      slotIndex >= selection.startSlotIndex &&
      slotIndex < selection.endSlotIndexExclusive
    ) {
      setSelection(null)
      return
    }

    const date = parseIsoDate(dateIso)

    // Clicking a cell immediately adjacent to the current selection extends it (req 7)
    if (selection && selection.dateIso === dateIso && isSlotAvailable(date, slotIndex)) {
      if (slotIndex === selection.endSlotIndexExclusive) {
        setSelection({ ...selection, endSlotIndexExclusive: slotIndex + 1 })
        return
      }
      if (slotIndex === selection.startSlotIndex - 1) {
        setSelection({ ...selection, startSlotIndex: slotIndex })
        return
      }
    }

    if (!isSlotAvailable(date, slotIndex)) {
      return
    }

    const nextSelection = {
      dateIso,
      startSlotIndex: slotIndex,
      endSlotIndexExclusive: slotIndex + 1,
    }
    setSelection(nextSelection)
    setDragStart(nextSelection)
  }

  const handleCellMouseEnter = (dateIso: string, slotIndex: number) => {
    if (!dragStart || dragStart.dateIso !== dateIso) {
      return
    }

    const startSlotIndex = Math.min(dragStart.startSlotIndex, slotIndex)
    const endSlotIndexExclusive = Math.max(dragStart.startSlotIndex, slotIndex) + 1

    if (!isRangeAvailable(dateIso, startSlotIndex, endSlotIndexExclusive)) {
      return
    }

    setSelection({
      dateIso,
      startSlotIndex,
      endSlotIndexExclusive,
    })
  }

  const handleCellClick = (dateIso: string, slotIndex: number) => {
    const cellBooking = slotBookings.get(`${dateIso}:${slotIndex}`)
    if (cellBooking?.booking.can_view_detail) {
      router.push(`/meetings/${cellBooking.booking.id}`)
    }
  }

  const shiftWeek = (direction: -1 | 1) => {
    setWeekStart((current) => addDays(current, direction * 7))
    setSelection(null)
  }

  const handleToday = () => {
    const focusDate = getDefaultMeetingFocusDate(new Date())
    setWeekStart(getDefaultMeetingWeekStart(focusDate))
    setActiveDayIso(toIsoDate(focusDate))
    setSelection(null)
  }

  if (roomsLoading) {
    return (
      <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-muted-foreground">
        Loading meeting rooms...
      </div>
    )
  }

  if (roomsError) {
    return (
      <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-rose-600">
        BdREN OpsSync could not load the meeting rooms right now.
      </div>
    )
  }

  if (!selectedRoom) {
    return (
      <div className="ops-stack">
        <OpsPageHeader
          eyebrow="Module 4.1 · MTG"
          title="Meeting booking"
          subtitle="Room setup is required before users can browse the availability grid."
        />
        <Card className="theme-panel rounded-[1.8rem] border-0">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active rooms are available. Configure a room in `/admin/rooms` first.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="ops-stack">
      {formSelection ? (
        <MeetingBookingForm
          key={`${selectedRoom.id}:${formSelection.dateIso}:${formSelection.startSlotIndex}:${formSelection.endSlotIndexExclusive}`}
          room={selectedRoom}
          selection={getRangeLabel(formSelection)}
          onClose={() => setFormSelection(null)}
          onBooked={() => {
            setFormSelection(null)
            setSelection(null)
          }}
        />
      ) : null}

      <OpsPageHeader
        eyebrow="Module 4.1 · MTG"
        title="Meeting booking"
        subtitle="Browse the room calendar, select a consecutive range of open slots, and submit the booking request in one document-first flow."
        actions={(
          <>
            <Button variant="outline" size="sm" onClick={() => shiftWeek(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => shiftWeek(1)}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      />

      <Card className="theme-panel rounded-[1.8rem] border-0">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <CardTitle>Live availability</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {visibleDays[0].toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {visibleDays[visibleDays.length - 1].toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={viewMode === 'week' ? 'default' : 'outline'}
                onClick={() => setViewMode('week')}
              >
                <Layers3 className="mr-2 h-4 w-4" />
                Week view
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'day' ? 'default' : 'outline'}
                onClick={() => setViewMode('day')}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                Day view
              </Button>
            </div>
          </div>

          <div className="tabs">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className={cn('tab', resolvedRoomId === room.id && 'active')}
                onClick={() => {
                  setSelectedRoomId(room.id)
                  setSelection(null)
                }}
              >
                {room.name}
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ops-ink-400)' }}>
                  · {room.capacity} seats
                </span>
                {room.name === DEFAULT_MEETING_ROOM_NAME ? (
                  <Badge className="ml-2" variant="secondary">Default</Badge>
                ) : null}
              </button>
            ))}
          </div>

          <div className="legend">
            <span className="legend-item">
              <span
                className="legend-sw"
                style={{
                  background: 'linear-gradient(180deg, oklch(0.61 0.11 150), var(--ops-success))',
                }}
              />
              Available
            </span>
            <span className="legend-item">
              <span className="legend-sw" style={{ background: 'linear-gradient(180deg, oklch(0.76 0.15 75), var(--ops-warning))' }} />
              Reserved
            </span>
            <span className="legend-item">
              <span className="legend-sw" style={{ background: 'linear-gradient(180deg, oklch(0.63 0.15 38), var(--ops-accent))' }} />
              Booked
            </span>
            <span className="legend-item">
              <span className="legend-sw" style={{ background: 'var(--ops-ink-100)' }} />
              Blocked
            </span>
            <span className="legend-item">
              <span className="legend-sw" style={{ background: 'var(--ops-primary)' }} />
              Your selection
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {slotsError ? (
            <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              BdREN OpsSync could not load the slot grid right now.
            </div>
          ) : null}

          <div className="cal-wrap" style={{ position: 'relative', gridTemplateColumns: `70px repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
            <div className="cal-header">Time</div>
            {visibleDays.map((day) => {
              const dayIso = toIsoDate(day)
              const isToday = dayIso === toIsoDate(today)
              const isSelectedDay = dayIso === resolvedActiveDayIso
              const bookable = isMeetingWorkday(day) && isWithinMeetingBookingWindow(day)

              return (
                <button
                  key={dayIso}
                  type="button"
                  className={cn('cal-header text-left', isToday && 'today')}
                  onClick={() => {
                    setActiveDayIso(dayIso)
                    if (viewMode === 'week') {
                      return
                    }
                  }}
                  style={{
                    textAlign: 'center',
                    opacity: bookable ? 1 : 0.7,
                    boxShadow: isSelectedDay ? 'inset 0 -2px 0 var(--ops-accent)' : undefined,
                  }}
                >
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                  <span className="day-num">{day.getDate()}</span>
                </button>
              )
            })}

            {MEETING_SLOT_TIMES.map((timeValue, slotIndex) => (
              <Fragment key={timeValue}>
                <div className="cal-time-col">{timeValue}</div>
                {visibleDays.map((day) => {
                  const dateIso = toIsoDate(day)
                  const bookingCell = slotBookings.get(`${dateIso}:${slotIndex}`)
                  const isSelected =
                    selection?.dateIso === dateIso &&
                    slotIndex >= selection.startSlotIndex &&
                    slotIndex < selection.endSlotIndexExclusive

                  const baseStatus = bookingCell
                    ? bookingCell.status
                    : !isMeetingWorkday(day) ||
                        !isWithinMeetingBookingWindow(day) ||
                        isPastMeetingSlot(day, slotIndex)
                      ? 'blocked'
                      : 'available'
                  const displayText = isSelected
                    ? 'Selected'
                    : !bookingCell && baseStatus === 'available'
                      ? 'Book now'
                      : ''
                  const tooltipLabel = bookingCell
                    ? `${bookingCell.booking.title} · ${bookingCell.booking.requester_name} · ${bookingCell.booking.start_time.slice(0, 5)}-${bookingCell.booking.end_time.slice(0, 5)}${bookingCell.booking.has_external_attendees ? ' · External guests' : ''}`
                    : `${formatDateLabel(dateIso)} · ${timeValue}`

                  return (
                    <button
                      key={`${dateIso}:${slotIndex}`}
                      type="button"
                      className={cn('cal-cell', baseStatus, isSelected && 'selected')}
                      onMouseDown={() => handleCellMouseDown(dateIso, slotIndex)}
                      onMouseEnter={() => handleCellMouseEnter(dateIso, slotIndex)}
                      onClick={() => handleCellClick(dateIso, slotIndex)}
                      onMouseUp={() => setDragStart(null)}
                      title={tooltipLabel}
                      aria-label={tooltipLabel}
                    >
                      {bookingCell ? (
                        <>
                          <div
                            className="cal-user-stripe"
                            style={{ background: userColorMap.get(bookingCell.booking.requester_name) ?? '#6b7280' }}
                          />
                          <div className="cal-cell-content has-stripe">
                            <div className="label">{bookingCell.titleLabel}</div>
                            <div className="meta">{bookingCell.requesterLabel}</div>
                          </div>
                        </>
                      ) : displayText ? (
                        <div className="cal-cell-content">
                          <div className="label">{displayText}</div>
                        </div>
                      ) : null}
                      {bookingCell?.booking.has_external_attendees ? (
                        <span className="guest-mark" aria-hidden="true">
                          *
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </Fragment>
            ))}

            {nowLineVisible ? (
              <div className="cal-now" style={{ top: `${nowLineTop}px` }} />
            ) : null}
          </div>

          {slotsLoading ? (
            <div className="text-sm text-muted-foreground">Refreshing room availability...</div>
          ) : null}

          {rangeSummary ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 14,
                borderRadius: 12,
                border: '1px solid var(--ops-primary-200)',
                background: 'var(--ops-primary-50)',
                padding: '12px 14px',
                fontSize: 13,
              }}
            >
              <Check className="h-4 w-4" />
              <strong>Selected:</strong>
              <span>{selectedRoom.name}</span>
              <span style={{ color: 'var(--ops-ink-400)' }}>·</span>
              <span>{rangeSummary.dateLabel}</span>
              <span style={{ color: 'var(--ops-ink-400)' }}>·</span>
              <span>
                {rangeSummary.startTime} - {rangeSummary.endTime}
              </span>
              <span className="ops-pill ops-pill-info">{rangeSummary.durationLabel}</span>
              <Button
                size="sm"
                className="ml-auto"
                onClick={() => selection && setFormSelection(selection)}
              >
                <Clock3 className="mr-2 h-4 w-4" />
                Book this slot
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelection(null)}
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-[color:var(--ops-ink-200)] bg-[color:var(--ops-ink-50)] px-4 py-3 text-sm text-muted-foreground">
              Select one or more consecutive green cells to open the booking request drawer. Pending or approved cells open the booking detail view.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
