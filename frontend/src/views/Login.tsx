'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowRight, LoaderCircle, MailCheck } from 'lucide-react'

import AuthShell from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'
import { useBranding } from '@/contexts/BrandingContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { getSafeRedirect } from '@/utils/redirects'

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('')
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { login, resendVerificationEmail, isAuthenticated, loading: authLoading } = useAuth()
  const { loginBannerUrl } = useBranding()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirect'))

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setResendCooldown((current) => (current > 1 ? current - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [resendCooldown])

  if (isAuthenticated) return null

  if (authLoading) {
    return (
      <div className="ops-auth-shell flex items-center justify-center">
        <div className="ops-card px-5 py-4 text-sm text-[color:var(--ops-ink-500)]">
          <div className="flex items-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--ops-primary)]" />
            Loading account access…
          </div>
        </div>
      </div>
    )
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
    if (recoveryIdentifier && event.target.name === 'username') {
      setRecoveryIdentifier(event.target.value)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(formData.username, formData.password)
    if (result.success) {
      setRecoveryIdentifier('')
      router.push(redirectTo)
    } else {
      setRecoveryIdentifier(formData.username.trim())
      setError(result.error ?? '')
    }
    setLoading(false)
  }

  const handleResendVerification = async () => {
    const identifier = recoveryIdentifier.trim() || formData.username.trim()
    if (!identifier || resending || resendCooldown > 0) {
      return
    }

    setResending(true)
    const result = await resendVerificationEmail(identifier)

    if (result.success) {
      setResendCooldown(120)
      toast({
        title: 'Verification email requested',
        description: result.message,
        variant: 'success',
        duration: 4200,
      })
    } else {
      toast({
        title: 'Could not resend email',
        description: result.error,
        variant: 'error',
        duration: 4500,
      })
    }

    setResending(false)
  }

  return (
    <AuthShell
      eyebrow="Account access"
      title="Sign in"
      description="Enter your credentials to continue into the BdREN OpsSync workspace."
      showcaseTitle="Operational access without a separate visual language."
      showcaseDescription="The sign-in flow now uses the same warm-paper system, document cues, and restrained panels as the internal application shell."
      imageSrc={loginBannerUrl}
      imageAlt="BdREN OpsSync login banner"
      metrics={[
        { value: '1 shell', label: 'Unified UX' },
        { value: '120s', label: 'Resend cooldown' },
        { value: 'Secure', label: 'Cookie session' },
      ]}
      highlights={[
        'Verification resend and password recovery stay available from the same entry point.',
        'Session completion and redirect handling are preserved.',
        'Social login options still share the same post-auth redirect flow.',
      ]}
      footer={(
        <div>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="ops-inline-link">
            Create one
          </Link>
        </div>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {recoveryIdentifier ? (
          <div className="rounded-[14px] border border-[color:var(--ops-secondary-200)] bg-[color:var(--ops-secondary-100)]/60 p-4 text-sm text-[color:var(--ops-ink-700)]">
            <div className="flex items-start gap-3">
              <div className="ops-auth-note-mark">
                <MailCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[color:var(--ops-ink-900)]">Need help signing in?</p>
                <p className="mt-1 leading-6">
                  If the account is eligible, BdREN OpsSync can resend a verification email or let you request a password reset without confirming whether the account exists.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full"
                    onClick={handleResendVerification}
                    disabled={resending || resendCooldown > 0}
                  >
                    {resending
                      ? 'Resending...'
                      : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend verification email'}
                  </Button>
                  <Link href="/forgot-password" className="self-center text-sm font-semibold text-[color:var(--ops-primary)]">
                    Reset password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center gap-2 rounded-[12px] border border-[color:var(--ops-danger-100)] bg-[color:var(--ops-danger-100)] px-4 py-3 text-sm text-[color:var(--ops-danger)]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ops-ink-500)]">
            Username or email
          </label>
          <Input
            name="username"
            type="text"
            autoComplete="username"
            placeholder="name@example.com"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ops-ink-500)]">
            Password
          </label>
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="pt-1 text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-[color:var(--ops-primary)]">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full rounded-[10px]">
          {loading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-5">
        <SocialLoginButtons nextPath={redirectTo} />
      </div>
    </AuthShell>
  )
}
