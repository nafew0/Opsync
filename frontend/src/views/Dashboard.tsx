'use client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.first_name || user?.username || 'there'}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Account status</CardDescription>
            <CardTitle>{user?.email_verified ? 'Verified' : 'Unverified'}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {user?.email_verified
              ? 'Your email address has been verified.'
              : 'Please check your inbox for a verification email.'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Organization</CardDescription>
            <CardTitle>{user?.organization || 'Not set'}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Keep your department and designation current from your profile.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Get started</CardDescription>
            <CardTitle>Build your app</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            BdREN OpsSync modules can be added here as the internal workflows come online.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
