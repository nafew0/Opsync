'use client'
import dynamic from 'next/dynamic'

import ProtectedRoute from '@/components/ProtectedRoute'
import OpsSidebar from './OpsSidebar'
import OpsTopbar from './OpsTopbar'

const NotificationBell = dynamic(() => import('@/components/NotificationBell'), { ssr: false })

interface OpsShellProps {
  children: React.ReactNode
}

export default function OpsShell({ children }: OpsShellProps) {
  return (
    <ProtectedRoute>
      <div className="ops-app">
        <OpsSidebar />
        <div className="ops-main">
          <OpsTopbar rightSlot={<NotificationBell />} />
          <div className="ops-page">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
