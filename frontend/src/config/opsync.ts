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
export type ModuleAccent = 'primary' | 'secondary' | 'accent'

export interface ModuleConfig {
  key: ModuleKey
  code: string
  label: string
  description: string
  href: string
  newHref: string
  icon: string
  colorVar: ModuleAccent
  shortLabel?: string
  planned?: boolean
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
    shortLabel: 'Rooms & calendars',
    planned: false,
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
    shortLabel: 'Catering & refreshment',
    planned: true,
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
    shortLabel: 'Supplies & stock',
    planned: true,
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
    shortLabel: 'Trips & dispatch',
    planned: true,
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
    shortLabel: 'Expense recovery',
    planned: true,
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
  { id: 'reports', label: 'Reports & Analytics', href: '/reports', icon: 'reports' },
]

export const ADMIN_NAV_ENTRIES: NavEntry[] = [
  { id: 'departments', label: 'Departments', href: '/admin/departments', icon: 'building' },
  { id: 'roles', label: 'User Roles', href: '/admin/roles', icon: 'users' },
  { id: 'rooms', label: 'Meeting Rooms', href: '/admin/rooms', icon: 'calendar' },
  { id: 'inventory', label: 'Inventory', href: '/admin/inventory', icon: 'box' },
  { id: 'fleet', label: 'Fleet', href: '/admin/fleet', icon: 'car' },
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

export interface StatusPresentation {
  label?: string
  variant: StatusVariant
}

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

export function getStatusPresentation(status: string, fallbackLabel?: string): StatusPresentation {
  return {
    label: fallbackLabel ?? status.replace(/_/g, ' '),
    variant: getStatusVariant(status),
  }
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
  '/profile': ['Account', 'Profile'],
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
  '/admin': ['Admin', 'Overview'],
  '/admin/departments': ['Admin', 'Departments'],
  '/admin/roles': ['Admin', 'User Roles'],
  '/admin/users': ['Admin', 'Users'],
  '/admin/settings': ['Admin', 'Settings'],
  '/admin/rooms': ['Admin', 'Meeting Rooms'],
  '/admin/inventory': ['Admin', 'Inventory'],
  '/admin/fleet': ['Admin', 'Fleet'],
}

export function getCrumbs(pathname: string): string[] {
  if (ROUTE_CRUMBS[pathname]) return ROUTE_CRUMBS[pathname]
  if (pathname.startsWith('/meetings/')) {
    return ['Request', 'Meeting Booking', 'Detail']
  }
  const parts = pathname.split('/').filter(Boolean)
  return parts.length > 0 ? parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)) : ['Dashboard']
}

export interface PageChromeConfig {
  eyebrow: string
  title: string
  subtitle: string
}

export interface PlaceholderPageConfig extends PageChromeConfig {
  href: string
  icon: string
  code?: string
  badge: string
  accent: ModuleAccent
  notes: string[]
}

export const PAGE_CHROME: Record<string, PageChromeConfig> = {
  '/dashboard': {
    eyebrow: 'Operations workspace',
    title: 'Daily command center',
    subtitle: 'Monitor what needs attention, launch requests quickly, and keep approvals moving without leaving the main shell.',
  },
  '/profile': {
    eyebrow: 'Account workspace',
    title: 'Profile & signature',
    subtitle: 'Manage the identity details, contact data, photo, and signature that appear across BdREN OpsSync documents.',
  },
  '/admin': {
    eyebrow: 'Control room',
    title: 'Admin overview',
    subtitle: 'Review platform health, account growth, and the configuration surfaces that support operations.',
  },
  '/admin/users': {
    eyebrow: 'Control room',
    title: 'Users',
    subtitle: 'Search, filter, and inspect account records without leaving the operational shell.',
  },
  '/admin/departments': {
    eyebrow: 'Control room',
    title: 'Departments',
    subtitle: 'Maintain the organizational structure used across routing, approvals, and user assignment.',
  },
  '/admin/roles': {
    eyebrow: 'Control room',
    title: 'User roles',
    subtitle: 'Assign operational roles and departments while keeping access rules visible to administrators.',
  },
  '/admin/settings': {
    eyebrow: 'Control room',
    title: 'Platform settings',
    subtitle: 'Manage branding, signup controls, social login, and AI provider settings from one restrained admin surface.',
  },
}

export const PLACEHOLDER_PAGES: Record<string, PlaceholderPageConfig> = {
  '/meetings': {
    href: '/meetings',
    eyebrow: 'Module 4.1 · MTG',
    title: 'Meeting booking workspace',
    subtitle: 'Live room availability, consecutive slot selection, and the document-first booking workflow are now active in this workspace.',
    icon: 'calendar',
    code: 'MTG',
    badge: 'Live module',
    accent: 'primary',
    notes: [
      'Board Room now exists as the seeded default room for scheduling.',
      'Live room availability and consecutive-slot selection.',
      'Meeting detail form with document preview and approval flow.',
      'Printable booking output aligned with the OpsSync document format.',
    ],
  },
  '/food': {
    href: '/food',
    eyebrow: 'Module 4.2 · FOD',
    title: 'Food requisition workspace',
    subtitle: 'Catering requests, headcount, budget framing, and approval-ready previews will follow this shell.',
    icon: 'food',
    code: 'FOD',
    badge: 'Planned for Phase 2',
    accent: 'secondary',
    notes: [
      'Request capture for meals, refreshments, and schedule windows.',
      'Approval-oriented summaries for managers and admin officers.',
      'Cost and headcount context presented in one document-style layout.',
    ],
  },
  '/logistics': {
    href: '/logistics',
    eyebrow: 'Module 4.3 · LOG',
    title: 'Logistics & stock workspace',
    subtitle: 'Supply requisitions and stock-aware approvals will use this area once the workflow phase begins.',
    icon: 'box',
    code: 'LOG',
    badge: 'Planned for Phase 2',
    accent: 'accent',
    notes: [
      'Stock-aware request forms and fulfillment states.',
      'Inventory context for admin officers and approvers.',
      'Printable requisition preview with traceable reference numbers.',
    ],
  },
  '/vehicles': {
    href: '/vehicles',
    eyebrow: 'Module 4.4 · VEH',
    title: 'Vehicle requisition workspace',
    subtitle: 'Trip requests, dispatch details, and routing approvals will be implemented on this frame in the next phase.',
    icon: 'car',
    code: 'VEH',
    badge: 'Planned for Phase 2',
    accent: 'primary',
    notes: [
      'Trip itinerary, vehicle choice, and driver coordination.',
      'Approval routing across line manager and admin roles.',
      'Dispatch-ready preview using the common OpsSync document pattern.',
    ],
  },
  '/conveyance': {
    href: '/conveyance',
    eyebrow: 'Module 4.5 · CVY',
    title: 'Conveyance claim workspace',
    subtitle: 'Local travel claims and finance handoff states will plug into this shell during Phase 2.',
    icon: 'receipt',
    code: 'CVY',
    badge: 'Planned for Phase 2',
    accent: 'secondary',
    notes: [
      'Journey line items, totals, and claimant signature handling.',
      'Supervisor and finance approval checkpoints.',
      'Document preview tuned for reimbursement workflows.',
    ],
  },
  '/reports': {
    href: '/reports',
    eyebrow: 'Manage',
    title: 'Reports & analytics',
    subtitle: 'Cross-module reporting will live here once request datasets and workflow metrics are fully wired.',
    icon: 'reports',
    badge: 'Planned for Phase 2',
    accent: 'accent',
    notes: [
      'Operational trends across meetings, food, logistics, vehicles, and claims.',
      'Department, role, and time-based filtering for admin review.',
      'Export-ready summaries for management reporting.',
    ],
  },
  '/admin/rooms': {
    href: '/admin/rooms',
    eyebrow: 'Admin setup',
    title: 'Meeting rooms',
    subtitle: 'Room inventory, capacity, and availability rules will be configured here before the meetings workflow ships.',
    icon: 'calendar',
    badge: 'Planned for Phase 2',
    accent: 'primary',
    notes: [
      'Room metadata, capacity, equipment, and availability windows.',
      'Admin controls for booking constraints and overrides.',
      'Shared configuration model for the meetings module.',
    ],
  },
  '/admin/inventory': {
    href: '/admin/inventory',
    eyebrow: 'Admin setup',
    title: 'Inventory',
    subtitle: 'Inventory catalogs, stock thresholds, and logistics fulfillment settings will be added here in the next phase.',
    icon: 'box',
    badge: 'Planned for Phase 2',
    accent: 'accent',
    notes: [
      'Stock item setup with codes, units, and threshold rules.',
      'Availability-aware logistics fulfillment controls.',
      'Operational ledger views for admin officers.',
    ],
  },
  '/admin/fleet': {
    href: '/admin/fleet',
    eyebrow: 'Admin setup',
    title: 'Fleet',
    subtitle: 'Vehicles, drivers, and dispatch readiness settings will be configured on this page in Phase 2.',
    icon: 'car',
    badge: 'Planned for Phase 2',
    accent: 'secondary',
    notes: [
      'Vehicle and driver master data.',
      'Availability, maintenance, and dispatch state management.',
      'Assignment context for vehicle requisitions.',
    ],
  },
}

export const INTERNAL_SHELL_PREFIXES = [
  '/dashboard',
  '/profile',
  '/meetings',
  '/food',
  '/logistics',
  '/vehicles',
  '/conveyance',
  '/reports',
  '/admin',
]
