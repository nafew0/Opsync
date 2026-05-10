import api from './api'

export const DEFAULT_MEETING_ROOM_NAME = 'Board Room'

export const MEETING_ROOM_EQUIPMENT_OPTIONS = [
  { value: 'projector', label: 'Projector' },
  { value: 'whiteboard', label: 'Whiteboard' },
  { value: 'video_conferencing', label: 'Video Conferencing' },
  { value: 'screen', label: 'Display Screen' },
  { value: 'sound_system', label: 'Sound System' },
] as const

export type MeetingRoomEquipmentValue = (typeof MEETING_ROOM_EQUIPMENT_OPTIONS)[number]['value']

export interface MeetingRoom {
  id: string
  name: string
  capacity: number
  equipment: MeetingRoomEquipmentValue[]
  equipment_labels: string[]
  notes: string
  is_active: boolean
  created_at: string
}

export interface MeetingRoomWrite {
  name: string
  capacity: number
  equipment: MeetingRoomEquipmentValue[]
  notes?: string
  is_active?: boolean
}

export interface MeetingSlot {
  id: string
  room_id: string
  date: string
  start_time: string
  end_time: string
  title: string
  requester_name: string
  has_external_attendees: boolean
  can_view_detail: boolean
  status: string
}

export interface MeetingBookingSummary {
  id: string
  reference_number: string
  room_id: string
  room_name: string
  date: string
  start_time: string
  end_time: string
  title: string
  requester_name: string
  has_external_attendees: boolean
  status: string
  created_at: string
}

export interface MeetingBookingDashboardSummary {
  my_pending_count: number
  my_open_count: number
  awaiting_my_action_count: number
  approved_this_month_count: number
  avg_approval_time_days: number | null
  recent_requests: MeetingBookingSummary[]
}

export interface MeetingBookingDetail {
  id: string
  reference_number: string
  room_id: string
  room_name: string
  room_capacity: number
  room_equipment_labels: string[]
  date: string
  start_time: string
  end_time: string
  title: string
  description: string
  attendee_count: number
  has_external_attendees: boolean
  external_attendee_notes: string
  equipment_requested: MeetingRoomEquipmentValue[]
  equipment_requested_labels: string[]
  status: string
  admin_comment: string
  reviewed_at: string | null
  reviewed_by_name: string
  reviewed_by_designation: string
  created_at: string
  updated_at: string
  requester_id: string
  requester_name: string
  requester_email: string
  requester_department_name: string
  requester_designation: string
}

export interface MeetingBookingWrite {
  room: string
  date: string
  start_time: string
  end_time: string
  title: string
  description?: string
  attendee_count: number
  has_external_attendees: boolean
  external_attendee_notes?: string
  equipment_requested: MeetingRoomEquipmentValue[]
}

export async function fetchMeetingRooms(): Promise<MeetingRoom[]> {
  const response = await api.get('/meetings/rooms/')
  return response.data
}

export async function createMeetingRoom(payload: MeetingRoomWrite): Promise<MeetingRoom> {
  const response = await api.post('/meetings/rooms/', payload)
  return response.data
}

export async function updateMeetingRoom(
  roomId: string,
  payload: Partial<MeetingRoomWrite>
): Promise<MeetingRoom> {
  const response = await api.patch(`/meetings/rooms/${roomId}/`, payload)
  return response.data
}

export async function deleteMeetingRoom(roomId: string): Promise<void> {
  await api.delete(`/meetings/rooms/${roomId}/`)
}

export async function fetchMeetingSlots(params: {
  room_id: string
  date_from: string
  date_to: string
}): Promise<MeetingSlot[]> {
  const response = await api.get('/meetings/slots/', { params })
  return response.data
}

export async function createBooking(payload: MeetingBookingWrite): Promise<MeetingBookingDetail> {
  const response = await api.post('/meetings/bookings/', payload)
  return response.data
}

export async function fetchBookings(params: {
  status?: string
  date_from?: string
  date_to?: string
  scope?: 'mine' | 'review' | 'all'
} = {}): Promise<MeetingBookingSummary[]> {
  const response = await api.get('/meetings/bookings/', { params })
  return response.data?.results ?? response.data
}

export async function fetchMeetingBookingDashboardSummary(): Promise<MeetingBookingDashboardSummary> {
  const response = await api.get('/meetings/bookings/summary/')
  return response.data
}

export async function fetchBookingDetail(bookingId: string): Promise<MeetingBookingDetail> {
  const response = await api.get(`/meetings/bookings/${bookingId}/`)
  return response.data
}

export async function approveBooking(bookingId: string): Promise<MeetingBookingDetail> {
  const response = await api.post(`/meetings/bookings/${bookingId}/approve/`)
  return response.data
}

export async function rejectBooking(
  bookingId: string,
  admin_comment: string
): Promise<MeetingBookingDetail> {
  const response = await api.post(`/meetings/bookings/${bookingId}/reject/`, {
    admin_comment,
  })
  return response.data
}

export async function cancelBooking(bookingId: string): Promise<MeetingBookingDetail> {
  const response = await api.post(`/meetings/bookings/${bookingId}/cancel/`)
  return response.data
}

export async function markBookingNoShow(bookingId: string): Promise<MeetingBookingDetail> {
  const response = await api.post(`/meetings/bookings/${bookingId}/no-show/`)
  return response.data
}
