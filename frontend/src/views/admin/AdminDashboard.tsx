'use client'
import { useQuery } from '@tanstack/react-query'

import OpsPageHeader from '@/components/opsync/OpsPageHeader'
import QLineChart from '@/components/charts/QLineChart'
import QPieChart from '@/components/charts/QPieChart'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getAdminDashboard } from '@/services/admin'

import { formatDateTime } from './admin-helpers'

function SummaryCard({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <Card className="theme-panel rounded-[1.6rem] border-0">
      <CardHeader className="pb-3">
        <CardDescription className="text-xs font-semibold uppercase tracking-[0.2em]">
          {label}
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{hint}</CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
  })

  if (isLoading) {
    return <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-muted-foreground">Loading admin analytics...</div>
  }

  if (error) {
    return <div className="theme-panel rounded-[1.8rem] p-6 text-sm text-rose-600">Could not load the admin dashboard right now.</div>
  }

  return (
    <div className="ops-stack">
      <OpsPageHeader
        eyebrow="Control room"
        title="Admin overview"
        subtitle="Review account growth, verification coverage, and recent platform activity from the main operational shell."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total users"
          value={data.summary.total_users}
          hint="All registered accounts."
        />
        <SummaryCard
          label="Active users"
          value={data.summary.active_users}
          hint="Accounts currently allowed to sign in."
        />
        <SummaryCard
          label="Verified users"
          value={data.summary.verified_users}
          hint="Accounts with verified email addresses."
        />
        <SummaryCard
          label="Admins"
          value={data.summary.superusers}
          hint={`${data.summary.staff_users} staff accounts including superusers.`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="theme-panel rounded-[1.8rem] border-0">
          <CardHeader>
            <CardTitle>User growth</CardTitle>
            <CardDescription>Monthly signup trend for the last six months.</CardDescription>
          </CardHeader>
          <CardContent>
            <QLineChart data={data.user_growth_over_time} showArea lines={[{ dataKey: 'count', name: 'Users' }]} />
          </CardContent>
        </Card>

        <Card className="theme-panel rounded-[1.8rem] border-0">
          <CardHeader>
            <CardTitle>Account status</CardTitle>
            <CardDescription>Active and inactive account split.</CardDescription>
          </CardHeader>
          <CardContent>
            <QPieChart data={data.account_status_breakdown} donut />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="theme-panel rounded-[1.8rem] border-0">
          <CardHeader>
            <CardTitle>Email verification</CardTitle>
            <CardDescription>Verified account coverage.</CardDescription>
          </CardHeader>
          <CardContent>
            <QPieChart data={data.email_verification_breakdown} donut colorScheme="secondary" />
          </CardContent>
        </Card>

        <Card className="theme-panel rounded-[1.8rem] border-0">
          <CardHeader>
            <CardTitle>Recent signups</CardTitle>
            <CardDescription>The latest accounts created in BdREN OpsSync.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recent_signups.map((signup: Record<string, string>) => (
              <div
                key={signup.id}
                className="rounded-[1.2rem] border border-[rgb(var(--theme-border-rgb)/0.78)] bg-white/80 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {`${signup.first_name || ''} ${signup.last_name || ''}`.trim() || signup.username}
                    </p>
                    <p className="text-sm text-muted-foreground">{signup.email}</p>
                  </div>
                  <Badge variant={signup.email_verified ? 'success' : 'warning'}>
                    {signup.email_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Joined {formatDateTime(signup.created_at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
