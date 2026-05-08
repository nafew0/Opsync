'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowRight, LoaderCircle, RotateCw } from 'lucide-react'

import AuthShell from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'
import { useBranding } from '@/contexts/BrandingContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { getSafeRedirect } from '@/utils/redirects'
import { getSignupChallenge } from '@/services/auth'

interface VerificationState {
  emailHint: string
  identifier: string
}

interface SignupChallengeState {
  captcha_enabled: boolean
  captcha_id: string
  captcha_prompt: string
  registration_token: string
  minimum_submit_seconds: number
}

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    captcha_answer: '',
    company_website: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationState, setVerificationState] = useState<VerificationState | null>(null)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [signupChallenge, setSignupChallenge] = useState<SignupChallengeState | null>(null)
  const [challengeLoading, setChallengeLoading] = useState(true)
  const [challengeRefreshing, setChallengeRefreshing] = useState(false)
  const [challengeError, setChallengeError] = useState('')

  const { register, resendVerificationEmail, isAuthenticated, loading: authLoading } = useAuth()
  const { registerBannerUrl } = useBranding()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirect'))

  const loadSignupChallenge = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setChallengeRefreshing(true)
    } else {
      setChallengeLoading(true)
    }
    setChallengeError('')

    try {
      const response = await getSignupChallenge()
      setSignupChallenge(response)
      setFormData((current) => ({ ...current, captcha_answer: '' }))
    } catch {
      setSignupChallenge(null)
      setChallengeError('Could not load signup protection. Refresh the form and try again.')
    } finally {
      if (refreshing) {
        setChallengeRefreshing(false)
      } else {
        setChallengeLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) {
      const timerId = window.setTimeout(() => {
        void loadSignupChallenge()
      }, 0)
      return () => window.clearTimeout(timerId)
    }
    return undefined
  }, [isAuthenticated, loadSignupChallenge])

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
            Loading signup workspace…
          </div>
        </div>
      </div>
    )
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!signupChallenge?.registration_token) {
      setError('Registration form is not ready yet. Refresh the page and try again.')
      return
    }

    setLoading(true)
    setError('')
    if (formData.password !== formData.password2) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const result = await register({
      ...formData,
      captcha_id: signupChallenge.captcha_id,
      registration_token: signupChallenge.registration_token,
    })

    if (result.success) {
      if (result.emailVerificationRequired) {
        setVerificationState({
          emailHint: result.emailHint ?? '',
          identifier: formData.email.trim(),
        })
        setResendCooldown(120)
      } else {
        router.push(redirectTo)
      }
    } else {
      setError(result.error ?? '')
      await loadSignupChallenge(Boolean(signupChallenge))
    }
    setLoading(false)
  }

  const handleResendVerification = async () => {
    const identifier = verificationState?.identifier?.trim()
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
      eyebrow={verificationState ? 'Email verification' : 'New account'}
      title={verificationState ? 'Check your email' : 'Create account'}
      description={
        verificationState
          ? `Your account is ready, but the email address must be verified before sign-in.${verificationState.emailHint ? ` The first link was sent to ${verificationState.emailHint}.` : ''}`
          : 'Set up your BdREN OpsSync access using the same operational design language as the main app.'
      }
      showcaseTitle="Registration, verification, and anti-abuse controls in one calm flow."
      showcaseDescription="Signup protection, social login, and email verification stay intact while the frontend adopts the shared editorial OpsSync system."
      imageSrc={registerBannerUrl}
      imageAlt="BdREN OpsSync registration banner"
      metrics={[
        { value: '120s', label: 'Resend cooldown' },
        { value: 'Protected', label: 'Signup challenge' },
        { value: 'Config-driven', label: 'Branding aware' },
      ]}
      highlights={[
        'Registration challenge loading and refresh behavior remain unchanged.',
        'Email verification handoff still pauses login until the address is confirmed.',
        'Social registration routes keep using the same redirect logic as direct signup.',
      ]}
      footer={(
        <div>
          Already have an account?{' '}
          <Link href="/login" className="ops-inline-link">
            Sign in
          </Link>
        </div>
      )}
    >
      {verificationState ? (
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[color:var(--ops-secondary-200)] bg-[color:var(--ops-secondary-100)]/60 p-4 text-sm leading-6 text-[color:var(--ops-ink-700)]">
            Use the verification link in your inbox to activate the account. You can ask for another link below once the cooldown expires.
          </div>
          <Button
            type="button"
            className="w-full rounded-[10px]"
            onClick={handleResendVerification}
            disabled={resending || resendCooldown > 0}
          >
            {resending
              ? 'Resending...'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend verification email'}
          </Button>
          <Button asChild variant="outline" className="w-full rounded-[10px]">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div className="flex items-center gap-2 rounded-[12px] border border-[color:var(--ops-danger-100)] bg-[color:var(--ops-danger-100)] px-4 py-3 text-sm text-[color:var(--ops-danger)]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { name: 'first_name', label: 'First name', type: 'text', autoComplete: 'given-name', placeholder: 'First name' },
                { name: 'last_name', label: 'Last name', type: 'text', autoComplete: 'family-name', placeholder: 'Last name' },
                { name: 'username', label: 'Username', type: 'text', autoComplete: 'username', placeholder: 'Choose a username' },
                { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'name@example.com' },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ops-ink-500)]">
                    {field.label}
                  </label>
                  <Input
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ops-ink-500)]">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ops-ink-500)]">
                  Confirm password
                </label>
                <Input
                  name="password2"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="company_website">Company website</label>
              <input
                id="company_website"
                name="company_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.company_website}
                onChange={handleChange}
              />
            </div>

            {challengeLoading ? (
              <div className="rounded-[12px] border border-[color:var(--ops-ink-200)] bg-[color:var(--ops-ink-50)] px-4 py-3 text-sm text-[color:var(--ops-ink-500)]">
                <div className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Preparing signup protection…
                </div>
              </div>
            ) : challengeError ? (
              <div className="rounded-[12px] border border-[color:var(--ops-danger-100)] bg-[color:var(--ops-danger-100)] px-4 py-3 text-sm text-[color:var(--ops-danger)]">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="m-0">{challengeError}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-[10px]"
                    onClick={() => void loadSignupChallenge()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : signupChallenge?.captcha_enabled ? (
              <div className="rounded-[14px] border border-[color:var(--ops-ink-200)] bg-[color:var(--ops-ink-50)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ops-ink-500)]">
                      Human check
                    </p>
                    <p className="mt-1 text-sm font-medium text-[color:var(--ops-ink-900)]">
                      {signupChallenge.captcha_prompt}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-[10px]"
                    onClick={() => void loadSignupChallenge(true)}
                    disabled={challengeRefreshing}
                  >
                    {challengeRefreshing ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing…
                      </>
                    ) : (
                      <>
                        <RotateCw className="mr-2 h-4 w-4" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ops-ink-500)]">
                    CAPTCHA answer
                  </label>
                  <Input
                    name="captcha_answer"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Type the result"
                    value={formData.captcha_answer}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading || challengeLoading || !signupChallenge?.registration_token}
              className="w-full rounded-[10px]"
            >
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-5">
            <SocialLoginButtons nextPath={redirectTo} />
          </div>
        </>
      )}
    </AuthShell>
  )
}
