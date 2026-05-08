'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  type Department,
  type DepartmentWrite,
} from '@/services/core'

// ─── Modal ────────────────────────────────────────────────────────────────────

interface DeptModalProps {
  initial?: Department
  onClose: () => void
  onSave: (data: DepartmentWrite & { id?: string }) => void
  saving: boolean
}

function DeptModal({ initial, onClose, onSave, saving }: DeptModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)

  const valid = name.trim().length > 0 && code.trim().length > 0

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background, white)', borderRadius: 20, padding: 28, width: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>
          {initial ? 'Edit department' : 'New department'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 5 }}>Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 5 }}>Code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="e.g. ENG"
              style={{ fontFamily: 'monospace' }}
            />
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>
              Used in reference numbers (max 10 chars).
            </p>
          </div>
          {initial && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 15, height: 15 }}
              />
              Active
            </label>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <Button variant="outline" className="rounded-xl" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            className="rounded-xl"
            disabled={!valid || saving}
            onClick={() => onSave({ id: initial?.id, name: name.trim(), code: code.trim(), is_active: isActive })}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function AdminDepartments() {
  const qc = useQueryClient()
  const [modalDept, setModalDept] = useState<Department | null | 'new'>(null)

  const { data: departments = [], isLoading, error } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => fetchDepartments(false),
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: DepartmentWrite & { id?: string }) => {
      const { id, ...data } = payload
      if (id) return updateDepartment(id, data)
      return createDepartment(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-departments'] })
      setModalDept(null)
    },
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateDepartment(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-departments'] }),
  })

  if (isLoading) {
    return <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-muted-foreground">Loading departments…</div>
  }

  if (error) {
    return <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-rose-600">Could not load departments.</div>
  }

  const active = departments.filter((d) => d.is_active)
  const inactive = departments.filter((d) => !d.is_active)

  return (
    <>
      {modalDept !== null && (
        <DeptModal
          initial={modalDept === 'new' ? undefined : modalDept}
          onClose={() => setModalDept(null)}
          onSave={(data) => saveMutation.mutate(data)}
          saving={saveMutation.isPending}
        />
      )}

      <Card className="theme-panel rounded-[1.8rem] border-0">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Departments</CardTitle>
            <CardDescription>
              {active.length} active · {inactive.length} inactive
            </CardDescription>
          </div>
          <Button className="rounded-xl" onClick={() => setModalDept('new')}>
            + New department
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  {['Code', 'Name', 'Members', 'Status', ''].map((h) => (
                    <th key={h} className="pb-3 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No departments yet. Add one above.
                    </td>
                  </tr>
                )}
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-t border-[rgb(var(--theme-border-rgb)/0.7)] transition hover:bg-white/40"
                  >
                    <td className="py-3 pr-6">
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
                        {dept.code}
                      </span>
                    </td>
                    <td className="py-3 pr-6 font-medium">{dept.name}</td>
                    <td className="py-3 pr-6 text-muted-foreground">{dept.member_count}</td>
                    <td className="py-3 pr-6">
                      <Badge variant={dept.is_active ? 'success' : 'danger'}>
                        {dept.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg h-7 px-3 text-xs"
                          onClick={() => setModalDept(dept)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg h-7 px-3 text-xs"
                          disabled={toggleActive.isPending}
                          onClick={() => toggleActive.mutate({ id: dept.id, is_active: !dept.is_active })}
                        >
                          {dept.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
