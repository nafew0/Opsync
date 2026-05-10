'use client'
import { useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarRange,
  Check,
  Clipboard,
  LoaderCircle,
  MonitorPlay,
  PencilLine,
  Presentation,
  Speaker,
  Video,
} from 'lucide-react'

import OpsPageHeader from '@/components/opsync/OpsPageHeader'
import { useToast } from '@/hooks/useToast'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  createMeetingRoom,
  DEFAULT_MEETING_ROOM_NAME,
  MEETING_ROOM_EQUIPMENT_OPTIONS,
  type MeetingRoom,
  type MeetingRoomEquipmentValue,
  type MeetingRoomWrite,
  fetchMeetingRooms,
  updateMeetingRoom,
} from '@/services/meetings'

const EQUIPMENT_ICON_MAP: Record<MeetingRoomEquipmentValue, ElementType> = {
  projector: Presentation,
  whiteboard: Clipboard,
  video_conferencing: Video,
  screen: MonitorPlay,
  sound_system: Speaker,
}

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
    fallback
  )
}

interface RoomModalProps {
  room: MeetingRoom | null
  open: boolean
  saving: boolean
  onClose: () => void
  onSave: (payload: MeetingRoomWrite & { id?: string }) => void
}

function RoomModal({ room, open, saving, onClose, onSave }: RoomModalProps) {
  const [name, setName] = useState(room?.name ?? '')
  const [capacity, setCapacity] = useState(room ? String(room.capacity) : '8')
  const [notes, setNotes] = useState(room?.notes ?? '')
  const [equipment, setEquipment] = useState<MeetingRoomEquipmentValue[]>(room?.equipment ?? [])
  const [isActive, setIsActive] = useState(room?.is_active ?? true)

  const isValid = name.trim().length > 0 && Number(capacity) > 0

  const toggleEquipment = (value: MeetingRoomEquipmentValue) => {
    setEquipment((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving && !nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{room ? 'Edit meeting room' : 'Add meeting room'}</DialogTitle>
          <DialogDescription>
            Keep room metadata clean so the scheduling surface can rely on accurate
            capacity and equipment data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_220px]">
            <div className="grid gap-2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Board Room"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-capacity">Capacity</Label>
              <Input
                id="room-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                placeholder="18"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="room-notes">Notes</Label>
            <Textarea
              id="room-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional room notes, setup guidance, or restrictions."
              className="min-h-[104px]"
            />
          </div>

          <div className="grid gap-3">
            <div>
              <Label>Equipment</Label>
              <p className="mt-1 text-sm text-[color:var(--ops-ink-500)]">
                These tags feed the room badges and future booking requests.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {MEETING_ROOM_EQUIPMENT_OPTIONS.map((option) => {
                const Icon = EQUIPMENT_ICON_MAP[option.value]
                const selected = equipment.includes(option.value)

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
                      checked={selected}
                      onChange={() => toggleEquipment(option.value)}
                      className="sr-only"
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
          </div>

          <div className="flex items-center justify-between rounded-[1rem] border border-[color:var(--ops-ink-200)] bg-[color:var(--ops-ink-50)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[color:var(--ops-ink-900)]">Room status</p>
              <p className="text-sm text-[color:var(--ops-ink-500)]">
                Inactive rooms stay in admin history but disappear from scheduling.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} disabled={saving} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                id: room?.id,
                name: name.trim(),
                capacity: Number(capacity),
                equipment,
                notes: notes.trim(),
                is_active: isActive,
              })
            }
            disabled={!isValid || saving}
          >
            {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            {room ? 'Save changes' : 'Create room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RoomStat({
  label,
  value,
  meta,
  tone = 'primary',
}: {
  label: string
  value: ReactNode
  meta: string
  tone?: 'primary' | 'secondary' | 'accent' | 'success'
}) {
  return (
    <div className="ops-stat" data-tone={tone}>
      <div className="ops-stat-label">{label}</div>
      <div className="ops-stat-value">{value}</div>
      <div className="ops-stat-meta">{meta}</div>
    </div>
  )
}

export default function AdminRooms() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: rooms = [], isLoading, error } = useQuery({
    queryKey: ['admin-meeting-rooms'],
    queryFn: fetchMeetingRooms,
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: MeetingRoomWrite & { id?: string }) => {
      const { id, ...roomPayload } = payload
      if (id) {
        return updateMeetingRoom(id, roomPayload)
      }
      return createMeetingRoom(roomPayload)
    },
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ['admin-meeting-rooms'] })
      setEditingRoom(null)
      setCreateOpen(false)
      toast({
        title: payload.id ? 'Room updated' : 'Room created',
        description: payload.id
          ? 'BdREN OpsSync saved the meeting room changes.'
          : 'BdREN OpsSync added the new room to scheduling.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Could not save room',
        description: getErrorMessage(error, 'BdREN OpsSync could not save this room right now.'),
        variant: 'error',
        duration: 4500,
      })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ roomId, isActive }: { roomId: string; isActive: boolean }) =>
      updateMeetingRoom(roomId, { is_active: isActive }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-meeting-rooms'] })
      toast({
        title: variables.isActive ? 'Room activated' : 'Room deactivated',
        description: variables.isActive
          ? 'The room is now available for scheduling.'
          : 'The room has been removed from active scheduling.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Status update failed',
        description: getErrorMessage(
          error,
          'BdREN OpsSync could not change the room status right now.'
        ),
        variant: 'error',
        duration: 4500,
      })
    },
  })

  if (isLoading) {
    return (
      <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-muted-foreground">
        Loading meeting rooms...
      </div>
    )
  }

  if (error) {
    return (
      <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-rose-600">
        BdREN OpsSync could not load meeting rooms right now.
      </div>
    )
  }

  const activeRooms = rooms.filter((room) => room.is_active)
  const defaultRoom =
    rooms.find((room) => room.name === DEFAULT_MEETING_ROOM_NAME) ?? rooms[0] ?? null
  const activeCapacity = activeRooms.reduce((total, room) => total + room.capacity, 0)
  const equippedRooms = activeRooms.filter((room) => room.equipment.length > 0).length

  return (
    <div className="ops-stack">
      {createOpen ? (
        <RoomModal
          key="create-room"
          room={null}
          open
          saving={saveMutation.isPending}
          onClose={() => setCreateOpen(false)}
          onSave={(payload) => saveMutation.mutate(payload)}
        />
      ) : null}
      {editingRoom ? (
        <RoomModal
          key={editingRoom.id}
          room={editingRoom}
          open
          saving={saveMutation.isPending}
          onClose={() => setEditingRoom(null)}
          onSave={(payload) => saveMutation.mutate(payload)}
        />
      ) : null}

      <OpsPageHeader
        eyebrow="Control room"
        title="Meeting rooms"
        subtitle="Manage the schedulable rooms that feed slot availability and the upcoming meeting workflow."
      />

      <div className="ops-stats-grid">
        <RoomStat
          label="Total rooms"
          value={rooms.length}
          meta={`${activeRooms.length} active in scheduling`}
        />
        <RoomStat
          label="Default room"
          value={defaultRoom?.name ?? 'Not set'}
          meta="Returned first so the scheduler can preselect it"
          tone="secondary"
        />
        <RoomStat
          label="Active seats"
          value={activeCapacity}
          meta="Combined capacity across active rooms"
          tone="accent"
        />
        <RoomStat
          label="AV-ready rooms"
          value={equippedRooms}
          meta="Rooms with at least one configured equipment tag"
          tone="success"
        />
      </div>

      <Card className="theme-panel rounded-[1.8rem] border-0">
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Room inventory</CardTitle>
            <CardDescription>
              Board Room is seeded into the database and pinned as the current default room.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>+ Add room</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.2rem] border border-[color:var(--ops-primary-200)] bg-[color:var(--ops-primary-50)] px-4 py-3 text-sm text-[color:var(--ops-primary)]">
            Scheduling currently defaults to <strong>{DEFAULT_MEETING_ROOM_NAME}</strong>.
            Additional active rooms will appear after it until a dedicated default selector is introduced.
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="pb-3 pr-4">Room</th>
                  <th className="pb-3 pr-4">Capacity</th>
                  <th className="pb-3 pr-4">Equipment</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No meeting rooms are configured yet.
                    </td>
                  </tr>
                ) : null}
                {rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-t border-[rgb(var(--theme-border-rgb)/0.7)] transition hover:bg-white/40"
                  >
                    <td className="py-4 pr-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="theme-icon-primary flex h-11 w-11 items-center justify-center rounded-[1rem]">
                          <CalendarRange className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">{room.name}</p>
                            {room.name === DEFAULT_MEETING_ROOM_NAME ? (
                              <Badge variant="secondary">Default</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 max-w-[34rem] text-sm text-muted-foreground">
                            {room.notes || 'No internal notes recorded for this room yet.'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <p className="font-medium text-foreground">{room.capacity}</p>
                      <p className="text-xs text-muted-foreground">Seats</p>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {room.equipment_labels.length > 0 ? (
                          room.equipment_labels.map((item) => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No fixed equipment</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={room.is_active}
                          disabled={toggleMutation.isPending}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ roomId: room.id, isActive: checked })
                          }
                        />
                        <Badge variant={room.is_active ? 'success' : 'warning'}>
                          {room.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 text-right align-top">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setEditingRoom(room)}
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
