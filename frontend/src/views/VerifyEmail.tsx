'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, LoaderCircle, TriangleAlert } from 'lucide-react'

import api from '@/services/api'
import AuthShell from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'

const INITIAL_STATE = {
  status: 'loading',
  message: 'Verifying your email…',
}

const INVALID_TOKEN_STATE = {
  status: 'error',
  message: 'Invalid or expired verification link. Please request a new verification email.',
}

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')?.trim() || ''
  const [verificationState, setVerificationState] = useState(() =>
    token ? INITIAL_STATE : INVALID_TOKEN_STATE
  )

  useEffect(() => {
    if (!token) {
      return
    }

    let ignore = false

    const verify = async () => {
      try {
        const response = await api.get('/auth/verify-email/', {
          params: { token },
        })

        if (!ignore) {
          setVerificationState({
            status: 'success',
            message: response.data?.detail || 'Email verified! You can now log in.',
          })
        }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { detail?: string } } }
        if (!ignore) {
          setVerificationState({
            status: 'error',
            message:
              axiosError.response?.data?.detail ||
              'Invalid or expired verification link. Please request a new verification email.',
          })
        }
      }
    }

    verify()

    return () => {
      ignore = true
    }
  }, [token])

  const isSuccess = verificationState.status === 'success'

  return (
    <AuthShell
      eyebrow="Email verification"
      title={verificationState.status === 'loading' ? 'Verifying email' : isSuccess ? 'Email verified' : 'Verification failed'}
      description={verificationState.message}
      showcaseTitle="Verification uses the same shell as the rest of account access."
      showcaseDescription="Email confirmation is now framed within the editorial authentication surface instead of a separate card-only treatment."
      metrics={[
        { value: '1 link', label: 'Token-based' },
        { value: 'Safe', label: 'Auth handoff' },
        { value: 'Shared', label: 'Design system' },
      ]}
      highlights={[
        'Verification still resolves against the existing backend endpoint.',
        'Success and failure states keep their original routing options.',
      ]}
    >
      <div className="space-y-4">
        <div
          className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${
            isSuccess
              ? 'bg-[color:var(--ops-success-100)] text-[color:var(--ops-success)]'
              : verificationState.status === 'error'
                ? 'bg-[color:var(--ops-danger-100)] text-[color:var(--ops-danger)]'
                : 'bg-[color:var(--ops-primary-100)] text-[color:var(--ops-primary)]'
          }`}
        >
          {verificationState.status === 'loading' ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <TriangleAlert className="h-6 w-6" />
          )}
        </div>

        <div className="flex gap-3">
          {isSuccess ? (
            <Button asChild className="rounded-[10px]">
              <Link href="/login">Go to login</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="rounded-[10px]">
                <Link href="/login">Back to login</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-[10px]">
                <Link href="/register">Create account again</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </AuthShell>
  )
}
