'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, LayoutDashboard, Settings, ShieldCheck, User } from "lucide-react"
import BrandLogo from '@/components/branding/BrandLogo'
import useAdminAccess from '@/hooks/useAdminAccess'
import { resolveApiAssetUrl } from '@/services/api'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { canAccessAdmin } = useAdminAccess()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U'
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--ops-ink-200)] bg-[rgba(255,255,255,0.76)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo compact />
          </Link>

          <div className="hidden flex-1 lg:block" />

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="rounded-full border border-transparent px-4 text-[color:var(--ops-ink-700)] hover:bg-[color:var(--ops-ink-100)] hover:text-[color:var(--ops-ink-900)]">Dashboard</Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={resolveApiAssetUrl(user?.avatar)} alt={user?.full_name || user?.username} />
                        <AvatarFallback className="bg-[color:var(--ops-secondary-100)] text-[color:var(--ops-accent-700)]">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl border-[color:var(--ops-ink-200)] bg-white/98 p-1 shadow-[var(--ops-shadow-lg)]" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
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
                    {canAccessAdmin ? (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full border border-transparent px-4 text-[color:var(--ops-ink-700)] hover:bg-[color:var(--ops-ink-100)] hover:text-[color:var(--ops-ink-900)]">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-5">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
