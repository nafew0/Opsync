/**
 * OpsSync application configuration.
 * All module metadata, role definitions, and status mappings live here
 * so pages remain free of hard-coded strings and can be driven by config.
 */

// ─── Modules ────────────────────────────────────────────────────────────────

export const MODULE_CODES = {
  meetings: 'MTG',
  food: 'FOD',
  logistics: 'LOG',
  fleet: 'VEH',
  claims: 'CVY',
} as const

export type ModuleKey = keyof typeof MODULE_CODES

export interface ModuleConfig {
  key: ModuleKey
  code: string
  label: string
  description: string
  href: string
  newHref: string
  icon: string
  colorVar: string
}

export const MODULES: ModuleConfig[] = [
  {
    key: 'meetings',
    code: MODULE_CODES.meetings,
    label: 'Meeting Booking',
    description: 'Book a room. Real-time slot availability across all rooms.',
    href: '/meetings',
    newHref: '/meetings/new',
    icon: 'calendar',
    colorVar: 'primary',
  },
  {
    key: 'food',
    code: MODULE_CODES.food,
    label: 'Food Requisition',
    description: 'Order meals or refreshments for a meeting.',
    href: '/food',
    newHref: '/food/new',
    icon: 'food',
    colorVar: 'secondary',
  },
  {
    key: 'logistics',
    code: MODULE_CODES.logistics,
    label: 'Logistics & Stock',
    description: 'Request supplies & consumables from inventory.',
    href: '/logistics',
    newHref: '/logistics/new',
    icon: 'box',
    colorVar: 'accent',
  },
  {
    key: 'fleet',
    code: MODULE_CODES.fleet,
    label: 'Vehicle Requisition',
    description: 'Request an official vehicle with driver.',
    href: '/vehicles',
    newHref: '/vehicles/new',
    icon: 'car',
    colorVar: 'primary',
  },
  {
    key: 'claims',
    code: MODULE_CODES.claims,
    label: 'Conveyance Claim',
    description: 'Submit local travel reimbursement claim.',
    href: '/conveyance',
    newHref: '/conveyance/new',
    icon: 'receipt',
    colorVar: 'secondary',
  },
]

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface NavSection {
  section: string
}

export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  code?: string
  soon?: boolean
}

export type NavEntry = NavSection | NavItem

export function isNavSection(entry: NavEntry): entry is NavSection {
  return 'section' in entry
}

export const NAV_ENTRIES: NavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { section: 'REQUEST' },
  { id: 'meetings', label: 'Meeting Booking', href: '/meetings', icon: 'calendar', code: 'MTG' },
  { id: 'food', label: 'Food Requisition', href: '/food', icon: 'food', code: 'FOD' },
  { id: 'logistics', label: 'Logistics & Stock', href: '/logistics', icon: 'box', code: 'LOG' },
  { id: 'vehicles', label: 'Vehicle Requisition', href: '/vehicles', icon: 'car', code: 'VEH' },
  { id: 'conveyance', label: 'Conveyance Claim', href: '/conveyance', icon: 'receipt', code: 'CVY' },
  { section: 'MANAGE' },
  { id: 'reports', label: 'Reports & Analytics', href: '/reports', icon: 'reports', soon: true },
]

export const ADMIN_NAV_ENTRIES: NavEntry[] = [
  { id: 'departments', label: 'Departments', href: '/admin/departments', icon: 'building' },
  { id: 'roles', label: 'User Roles', href: '/admin/roles', icon: 'users' },
  { id: 'rooms', label: 'Meeting Rooms', href: '/admin/rooms', icon: 'calendar', soon: true },
  { id: 'inventory', label: 'Inventory', href: '/admin/inventory', icon: 'box', soon: true },
  { id: 'fleet', label: 'Fleet', href: '/admin/fleet', icon: 'car', soon: true },
]

// ─── Roles ──────────────────────────────────────────────────────────────────

export interface RoleConfig {
  value: string
  label: string
  description: string
  level: number
}

export const ROLES: RoleConfig[] = [
  { value: 'employee', label: 'Employee', description: 'Standard requester', level: 0 },
  { value: 'supervisor', label: 'Supervisor', description: 'Approves vehicle & conveyance requests', level: 1 },
  { value: 'line_manager', label: 'Line Manager', description: 'Approves food & vehicle requests', level: 2 },
  { value: 'admin_officer', label: 'Admin Officer', description: 'Processes meetings, logistics, vehicles, claims', level: 3 },
  { value: 'am_dm', label: 'AM/DM (Admin)', description: 'Final approval for logistics & vehicles', level: 4 },
  { value: 'finance_officer', label: 'Finance Officer', description: 'Approves & processes conveyance claims', level: 3 },
  { value: 'system_admin', label: 'System Admin', description: 'Full system access', level: 5 },
]

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label])
)

// ─── Status colours ─────────────────────────────────────────────────────────

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export const STATUS_VARIANT_MAP: Record<string, StatusVariant> = {
  // Generic
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
  completed: 'success',
  processing: 'info',
  // Meetings
  no_show: 'danger',
  // Logistics / vehicles
  recommended: 'info',
  dispatched: 'success',
  assigned: 'info',
  // Claims
  supervisor_approved: 'info',
  finance_approved: 'success',
  paid: 'success',
  // General
  active: 'success',
  inactive: 'neutral',
  available: 'success',
  on_trip: 'warning',
  maintenance: 'neutral',
}

export function getStatusVariant(status: string): StatusVariant {
  return STATUS_VARIANT_MAP[status.toLowerCase()] ?? 'neutral'
}

// ─── Reference numbers ───────────────────────────────────────────────────────

export function formatRefNumber(module: ModuleKey, seq: number, year = new Date().getFullYear()): string {
  return `BDREN-${MODULE_CODES[module]}-${year}-${String(seq).padStart(5, '0')}`
}

// ─── API base paths ──────────────────────────────────────────────────────────

export const API_PATHS = {
  core: {
    departments: '/core/departments/',
    notifications: '/core/notifications/',
    notificationsUnreadCount: '/core/notifications/unread-count/',
    notificationsReadAll: '/core/notifications/read-all/',
    auditLog: '/core/audit-log/',
  },
}

// ─── Breadcrumb labels ───────────────────────────────────────────────────────

export const ROUTE_CRUMBS: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/meetings': ['Request', 'Meeting Booking'],
  '/meetings/new': ['Request', 'Meeting Booking', 'New'],
  '/food': ['Request', 'Food Requisition'],
  '/food/new': ['Request', 'Food Requisition', 'New'],
  '/logistics': ['Request', 'Logistics & Stock'],
  '/logistics/new': ['Request', 'Logistics & Stock', 'New'],
  '/vehicles': ['Request', 'Vehicle Requisition'],
  '/vehicles/new': ['Request', 'Vehicle Requisition', 'New'],
  '/conveyance': ['Request', 'Conveyance Claim'],
  '/conveyance/new': ['Request', 'Conveyance Claim', 'New'],
  '/reports': ['Manage', 'Reports & Analytics'],
  '/admin/departments': ['Admin', 'Departments'],
  '/admin/roles': ['Admin', 'User Roles'],
}

export function getCrumbs(pathname: string): string[] {
  if (ROUTE_CRUMBS[pathname]) return ROUTE_CRUMBS[pathname]
  const parts = pathname.split('/').filter(Boolean)
  return parts.length > 0 ? parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)) : ['Dashboard']
}
