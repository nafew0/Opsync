'use client'
import { useRouter } from 'next/navigation'
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react'

import useAdminAccess from '@/hooks/useAdminAccess'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { resolveApiAssetUrl } from '@/services/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface OpsUserMenuProps {
  compact?: boolean
}

function getUserInitials(firstName?: string, lastName?: string, username?: string) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  return username?.slice(0, 2).toUpperCase() || 'U'
}

export default function OpsUserMenu({ compact = false }: OpsUserMenuProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { canAccessAdmin } = useAdminAccess()

  if (!user) {
    return null
  }

  const displayName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
  const initials = getUserInitials(user.first_name, user.last_name, user.username)
  const showAdminLink =
    canAccessAdmin ||
    user.is_superuser ||
    ['admin_officer', 'am_dm', 'system_admin'].includes(user.opsync_role ?? '')

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-10 rounded-full border border-[color:var(--ops-ink-200)] bg-white/88 text-[color:var(--ops-ink-700)] shadow-sm hover:bg-white hover:text-[color:var(--ops-ink-900)]',
            compact ? 'w-10 px-0' : 'gap-2.5 px-2'
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={resolveApiAssetUrl(user.avatar)}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-[color:var(--ops-secondary-100)] text-[color:var(--ops-accent-700)]">
              {initials}
            </AvatarFallback>
          </Avatar>
          {compact ? null : (
            <>
              <span className="max-w-[11rem] truncate text-sm font-medium">{displayName}</span>
              <ChevronDown className="h-4 w-4 text-[color:var(--ops-ink-500)]" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        forceMount
        className="w-64 rounded-2xl border-[color:var(--ops-ink-200)] bg-white/98 p-1 shadow-[var(--ops-shadow-lg)]"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        {showAdminLink ? (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
