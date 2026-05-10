export const MEETING_SLOT_TIMES = Array.from({ length: 16 }, (_value, index) => {
  const hour = 9 + Math.floor(index / 2)
  const minute = index % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${minute}`
})

export const MEETING_WORKDAY_WEEKDAYS = [0, 1, 2, 3, 4]
export const MEETING_BOOKING_WINDOW_DAYS = 14

export function normalizeTimeValue(value: string) {
  return (value || '').slice(0, 5)
}

export function getSlotIndexForTime(value: string) {
  return MEETING_SLOT_TIMES.indexOf(normalizeTimeValue(value))
}

export function getEndSlotIndexExclusive(value: string) {
  const normalized = normalizeTimeValue(value)
  if (normalized === '17:00') {
    return MEETING_SLOT_TIMES.length
  }
  return getSlotIndexForTime(normalized)
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function startOfMeetingWeek(value = new Date()) {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const sundayOffset = date.getDay()
  date.setDate(date.getDate() - sundayOffset)
  return date
}

export function isMeetingWorkday(date: Date) {
  return MEETING_WORKDAY_WEEKDAYS.includes(date.getDay())
}

export function getDefaultMeetingFocusDate(now = new Date()) {
  let date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  if (isMeetingWorkday(date) && nowMinutes < 17 * 60) {
    return date
  }

  date = addDays(date, 1)
  while (!isMeetingWorkday(date)) {
    date = addDays(date, 1)
  }
  return date
}

export function getDefaultMeetingWeekStart(now = new Date()) {
  return startOfMeetingWeek(getDefaultMeetingFocusDate(now))
}

export function getMeetingWeekDays(weekStart: Date) {
  return Array.from({ length: 5 }, (_value, index) => addDays(weekStart, index))
}

export function isWithinMeetingBookingWindow(date: Date, now = new Date()) {
  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const bookingWindowEnd = addDays(currentDay, MEETING_BOOKING_WINDOW_DAYS)
  return date >= currentDay && date <= bookingWindowEnd
}

export function getMeetingRangeSummary(
  date: Date,
  startSlotIndex: number,
  endSlotIndexExclusive: number
) {
  const startTime = MEETING_SLOT_TIMES[startSlotIndex]
  const endTime = endSlotIndexExclusive >= MEETING_SLOT_TIMES.length
    ? '17:00'
    : MEETING_SLOT_TIMES[endSlotIndexExclusive]
  const durationMinutes = (endSlotIndexExclusive - startSlotIndex) * 30

  return {
    dateIso: toIsoDate(date),
    dateLabel: date.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    startTime,
    endTime,
    durationMinutes,
    durationLabel:
      durationMinutes % 60 === 0
        ? `${durationMinutes / 60}h`
        : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
  }
}

export function isPastMeetingSlot(date: Date, slotIndex: number, now = new Date()) {
  const dateIso = toIsoDate(date)
  const todayIso = toIsoDate(now)

  if (dateIso < todayIso) {
    return true
  }

  if (dateIso > todayIso) {
    return false
  }

  const [hours, minutes] = MEETING_SLOT_TIMES[slotIndex].split(':').map(Number)
  const slotEndMinutes = hours * 60 + minutes + 30
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return slotEndMinutes <= nowMinutes
}

export function formatTimeLabel(value: string) {
  return normalizeTimeValue(value)
}

export function formatDateLabel(value: string) {
  const date = parseIsoDate(value)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function truncateLabel(value: string, maxLength = 24) {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, maxLength - 1)}…`
}
