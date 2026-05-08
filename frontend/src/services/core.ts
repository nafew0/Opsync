import api from './api'
import { API_PATHS } from '@/config/opsync'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Department {
  id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
  member_count: number
}

export interface DepartmentWrite {
  name: string
  code: string
  is_active?: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  module: string
  reference_number: string
  link: string
  is_read: boolean
  created_at: string
}

export interface AuditLogEntry {
  id: string
  user: string | null
  user_username: string
  action: string
  module: string
  reference_number: string
  previous_status: string
  new_status: string
  comment: string
  ip_address: string | null
  created_at: string
}

// ─── Departments ─────────────────────────────────────────────────────────────

export async function fetchDepartments(activeOnly = true): Promise<Department[]> {
  const params = activeOnly ? undefined : { active: 'all' }
  const res = await api.get(API_PATHS.core.departments, { params })
  return res.data?.results ?? res.data
}

export async function createDepartment(data: DepartmentWrite): Promise<Department> {
  const res = await api.post(API_PATHS.core.departments, data)
  return res.data
}

export async function updateDepartment(id: string, data: Partial<DepartmentWrite>): Promise<Department> {
  const res = await api.patch(`${API_PATHS.core.departments}${id}/`, data)
  return res.data
}

export async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`${API_PATHS.core.departments}${id}/`)
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await api.get(API_PATHS.core.notifications)
  return res.data?.results ?? res.data
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get(API_PATHS.core.notificationsUnreadCount)
  return res.data?.count ?? 0
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`${API_PATHS.core.notifications}${id}/read/`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post(API_PATHS.core.notificationsReadAll)
}

// ─── Audit log ───────────────────────────────────────────────────────────────

export interface AuditLogFilters {
  module?: string
  reference_number?: string
  date_from?: string
  date_to?: string
}

export async function fetchAuditLog(filters?: AuditLogFilters): Promise<AuditLogEntry[]> {
  const res = await api.get(API_PATHS.core.auditLog, { params: filters })
  return res.data?.results ?? res.data
}
