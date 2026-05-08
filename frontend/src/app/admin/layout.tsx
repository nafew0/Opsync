import AdminRoute from '@/components/AdminRoute'
import OpsShell from '@/components/opsync/OpsShell'

export default function AdminLayoutShim({ children }: { children: React.ReactNode }) {
  return (
    <OpsShell>
      <AdminRoute>{children}</AdminRoute>
    </OpsShell>
  )
}
