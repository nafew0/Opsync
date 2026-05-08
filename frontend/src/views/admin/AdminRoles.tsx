'use client'
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { CustomSelect } from '@/components/ui/custom-select'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getAdminUsers, updateAdminUser } from '@/services/admin'
import { fetchDepartments } from '@/services/core'
import { ROLES, ROLE_LABELS } from '@/config/opsync'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRoleRow {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  opsync_role: string
  department_id: string | null
  department_name: string
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RoleRowProps {
  user: UserRoleRow
  deptOptions: { label: string; value: string }[]
  onUpdate: (userId: string, patch: { opsync_role?: string; department?: string | null }) => void
  saving: boolean
}

function RoleRow({ user, deptOptions, onUpdate, saving }: RoleRowProps) {
  const [role, setRole] = useState(user.opsync_role || 'employee')
  const [dept, setDept] = useState(user.department_id ?? '')
  const dirty = role !== (user.opsync_role || 'employee') || dept !== (user.department_id ?? '')

  const handleSave = () => {
    onUpdate(user.id, {
      opsync_role: role,
      department: dept || null,
    })
  }

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username

  return (
    <tr className="border-t border-[rgb(var(--theme-border-rgb)/0.7)] transition hover:bg-white/40">
      <td className="py-3 pr-4">
        <p className="font-medium text-foreground leading-tight">{displayName}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </td>
      <td className="py-3 pr-4" style={{ minWidth: 190 }}>
        <CustomSelect
          value={role}
          onChange={(v) => setRole(String(v))}
          options={ROLES.map((r) => ({ label: r.label, value: r.value }))}
        />
      </td>
      <td className="py-3 pr-4" style={{ minWidth: 190 }}>
        <CustomSelect
          value={dept}
          onChange={(v) => setDept(String(v))}
          options={[{ label: '— None —', value: '' }, ...deptOptions]}
        />
      </td>
      <td className="py-3">
        {dirty && (
          <button
            disabled={saving}
            onClick={handleSave}
            style={{
              padding: '4px 12px', fontSize: 12, fontWeight: 600, borderRadius: 8,
              background: 'rgb(var(--theme-primary-soft-rgb)/0.9)',
              color: 'rgb(var(--theme-primary-ink-rgb))',
              border: '1px solid rgb(var(--theme-primary-ink-rgb)/0.2)',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function AdminRoles() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users-roles'],
    queryFn: () => getAdminUsers({ ordering: 'username', page: '1' }),
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => fetchDepartments(false),
  })

  const deptOptions = useMemo(
    () => departments.filter((d) => d.is_active).map((d) => ({ label: d.name, value: d.id })),
    [departments]
  )

  const saveMutation = useMutation({
    mutationFn: ({ userId, patch }: { userId: string; patch: Record<string, unknown> }) =>
      updateAdminUser(userId, patch),
    onMutate: ({ userId }) => setSavingId(userId),
    onSettled: () => {
      setSavingId(null)
      qc.invalidateQueries({ queryKey: ['admin-users-roles'] })
    },
  })

  const handleUpdate = (
    userId: string,
    patch: { opsync_role?: string; department?: string | null }
  ) => saveMutation.mutate({ userId, patch })

  const users: UserRoleRow[] = usersData?.results ?? []
  const filtered = search
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          [u.first_name, u.last_name].join(' ').toLowerCase().includes(search.toLowerCase())
      )
    : users

  if (loadingUsers) {
    return <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-muted-foreground">Loading users…</div>
  }

  const roleCounts = ROLES.map((r) => ({
    ...r,
    count: users.filter((u) => (u.opsync_role || 'employee') === r.value).length,
  }))

  return (
    <div className="space-y-5">
      {/* Role summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {roleCounts.filter((r) => r.count > 0 || r.level >= 3).map((r) => (
          <div
            key={r.value}
            className="theme-panel rounded-[1.2rem] p-3"
            style={{ borderRadius: 14 }}
          >
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {r.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>{r.count}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>{r.description}</div>
          </div>
        ))}
      </div>

      {/* User table */}
      <Card className="theme-panel rounded-[1.8rem] border-0">
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            Assign OpsSync roles and departments. Changes take effect immediately.
          </CardDescription>
          <div style={{ marginTop: 8 }}>
            <Input
              placeholder="Search by name, username, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  {['User', 'OpsSync Role', 'Department', ''].map((h, i) => (
                    <th key={i} className="pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
                {filtered.map((user) => (
                  <RoleRow
                    key={user.id}
                    user={user}
                    deptOptions={deptOptions}
                    onUpdate={handleUpdate}
                    saving={savingId === user.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {usersData?.count > users.length && (
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Showing first {users.length} of {usersData.count} users. Use the Users section to manage more.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
