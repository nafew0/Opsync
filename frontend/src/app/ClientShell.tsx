'use client'
import { usePathname } from 'next/navigation'

import Navbar from '@/components/Navbar'
import { INTERNAL_SHELL_PREFIXES } from '@/config/opsync'

const NO_NAVBAR_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/social/callback',
  ...INTERNAL_SHELL_PREFIXES,
]

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const showNavbar = !NO_NAVBAR_PATHS.some((p) => pathname.startsWith(p))

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={showNavbar ? 'pt-16' : ''}>{children}</main>
    </>
  )
}
