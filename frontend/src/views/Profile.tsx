'use client'
import { useEffect, useRef, useState } from 'react'
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  LoaderCircle,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { resolveApiAssetUrl } from '@/services/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface UserData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  organization?: string
  designation?: string
  bio?: string
  username?: string
  avatar?: string
  created_at?: string
}

interface ProfileFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  organization: string
  designation: string
  bio: string
}

function buildFormState(user: UserData | null): ProfileFormData {
  return {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    designation: user?.designation || '',
    bio: user?.bio || '',
  }
}

function formatMemberSince(value: string | undefined) {
  if (!value) return 'Recently joined'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently joined'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function getInitials(user: UserData | null, formData: ProfileFormData) {
  const first = (formData.first_name || user?.first_name || '').trim()
  const last = (formData.last_name || user?.last_name || '').trim()
  if (first || last) {
    return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || 'U'
  }
  return user?.username?.slice(0, 2).toUpperCase() || 'U'
}

const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024
const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const SIGNATURE_MAX_SIZE_BYTES = 500 * 1024  // 500 KB
const SIGNATURE_ACCEPTED_TYPES = ['image/jpeg', 'image/png']

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sigInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<ProfileFormData>(() => buildFormState(user))
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [uploadingSignature, setUploadingSignature] = useState(false)

  useEffect(() => {
    // Sync authenticated user data into the editable profile form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(buildFormState(user))
    setAvatarPreview(resolveApiAssetUrl(user?.avatar))
  }, [user])

  const displayName = `${formData.first_name} ${formData.last_name}`.trim() || user?.username || 'Your profile'

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingProfile(true)
    const result = await updateUser({
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim(),
      organization: formData.organization.trim(),
      designation: formData.designation.trim(),
      bio: formData.bio.trim(),
    })
    if (result.success) {
      toast({ title: 'Profile updated', description: 'Your profile details were saved successfully.', variant: 'success' })
    } else {
      toast({ title: 'Could not update profile', description: result.error, variant: 'error', duration: 4500 })
    }
    setSavingProfile(false)
  }

  const handleAvatarClick = () => {
    if (!uploadingAvatar) fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: 'Invalid image format', description: 'Use a JPG, PNG, WEBP, or GIF image for your avatar.', variant: 'error' })
      event.target.value = ''
      return
    }
    if (file.size > AVATAR_MAX_SIZE_BYTES) {
      toast({ title: 'Image too large', description: 'Avatar images must be 5 MB or smaller.', variant: 'error' })
      event.target.value = ''
      return
    }
    const previewUrl = URL.createObjectURL(file)
    const previousPreview = avatarPreview
    setAvatarPreview(previewUrl)
    setUploadingAvatar(true)
    const payload = new FormData()
    payload.append('avatar', file)
    const result = await updateUser(payload)
    URL.revokeObjectURL(previewUrl)
    if (result.success) {
      setAvatarPreview(resolveApiAssetUrl(result.user?.avatar))
      toast({ title: 'Avatar updated', description: 'Your profile photo is now live.', variant: 'success' })
    } else {
      setAvatarPreview(previousPreview)
      toast({ title: 'Avatar upload failed', description: result.error, variant: 'error', duration: 4500 })
    }
    setUploadingAvatar(false)
    event.target.value = ''
  }

  const handleSignatureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!SIGNATURE_ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: 'Invalid format', description: 'Signature must be a PNG or JPG image.', variant: 'error' })
      event.target.value = ''
      return
    }
    if (file.size > SIGNATURE_MAX_SIZE_BYTES) {
      toast({ title: 'Image too large', description: 'Signature image must be 500 KB or smaller.', variant: 'error' })
      event.target.value = ''
      return
    }
    setUploadingSignature(true)
    const payload = new FormData()
    payload.append('signature', file)
    const result = await updateUser(payload)
    if (result.success) {
      toast({ title: 'Signature uploaded', description: 'Your signature will appear on documents.', variant: 'success' })
    } else {
      toast({ title: 'Signature upload failed', description: result.error, variant: 'error', duration: 4500 })
    }
    setUploadingSignature(false)
    event.target.value = ''
  }

  const handleRemoveSignature = async () => {
    setUploadingSignature(true)
    const result = await updateUser({ signature: null })
    if (result.success) {
      toast({ title: 'Signature removed', description: 'Your signature has been removed.', variant: 'success' })
    } else {
      toast({ title: 'Could not remove signature', description: result.error, variant: 'error', duration: 4500 })
    }
    setUploadingSignature(false)
  }

  const profileFields = [
    { id: 'first_name', label: 'First Name', icon: UserRound, placeholder: 'First name', autoComplete: 'given-name' },
    { id: 'last_name', label: 'Last Name', icon: UserRound, placeholder: 'Last name', autoComplete: 'family-name' },
    { id: 'email', label: 'Email', icon: Mail, placeholder: 'Email address', autoComplete: 'email', readOnly: true, description: 'Email changes will follow the verification flow in a later phase.' },
    { id: 'phone', label: 'Phone', icon: Phone, placeholder: '+880 1XXX XXXXXX', autoComplete: 'tel' },
    { id: 'organization', label: 'Organization', icon: Building2, placeholder: 'BdREN', autoComplete: 'organization' },
    { id: 'designation', label: 'Designation', icon: BriefcaseBusiness, placeholder: 'Operations Officer', autoComplete: 'organization-title' },
  ]

  return (
    <div className="theme-app-gradient min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="theme-chip-secondary mb-3 inline-flex">Profile workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--theme-primary-ink-rgb))]">
              Manage your account
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Update your contact details and profile photo without leaving the current site theme.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Card className="theme-panel border-0">
            <CardHeader className="pb-4">
              <CardTitle>Public profile</CardTitle>
              <CardDescription>Keep your avatar and account identity up to date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AVATAR_ACCEPTED_TYPES.join(',')}
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="group relative inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Upload avatar"
                >
                  <Avatar className="h-32 w-32 rounded-full border border-[rgb(var(--theme-border-rgb)/0.9)] shadow-[0_18px_40px_rgb(var(--theme-shadow-rgb)/0.15)]">
                    <AvatarImage src={avatarPreview} alt={`${displayName} avatar`} className="object-cover" />
                    <AvatarFallback className="rounded-full bg-[rgb(var(--theme-primary-soft-rgb))] text-3xl font-semibold text-[rgb(var(--theme-primary-ink-rgb))]">
                      {getInitials(user, formData)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-[rgb(var(--theme-primary-rgb))] text-white shadow-lg transition group-hover:scale-105">
                    {uploadingAvatar ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </span>
                </button>
                <Button type="button" variant="ghost" className="mt-4 rounded-full" onClick={handleAvatarClick} disabled={uploadingAvatar}>
                  {uploadingAvatar ? 'Uploading photo...' : 'Change photo'}
                </Button>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">{displayName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">@{user?.username}</p>
              </div>

              <div className="grid gap-3">
                <div className="theme-panel-soft flex items-center gap-3 px-4 py-3">
                  <span className="theme-icon-secondary inline-flex h-10 w-10 items-center justify-center rounded-full">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Member since</p>
                    <p className="text-sm font-medium">{formatMemberSince(user?.created_at)}</p>
                  </div>
                </div>
              </div>

              <p className="rounded-2xl border border-dashed border-[rgb(var(--theme-border-rgb)/0.9)] bg-[rgb(var(--theme-neutral-rgb)/0.82)] px-4 py-3 text-sm text-muted-foreground">
                Avatar uploads support JPG, PNG, WEBP, and GIF files up to 5 MB.
              </p>
            </CardContent>
          </Card>

          <Card className="theme-panel border-0">
            <CardHeader className="pb-4">
              <CardTitle>Account details</CardTitle>
              <CardDescription>These details appear across your BdREN OpsSync workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  {profileFields.map((field) => {
                    const Icon = field.icon
                    return (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <div className="relative">
                          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id={field.id}
                            name={field.id}
                            type={field.id === 'email' ? 'email' : 'text'}
                            autoComplete={field.autoComplete}
                            value={formData[field.id as keyof ProfileFormData]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            readOnly={field.readOnly}
                            className="h-11 rounded-2xl pl-10"
                          />
                        </div>
                        {field.description ? <p className="text-xs text-muted-foreground">{field.description}</p> : null}
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell colleagues what you do and which workflows you support."
                    className="min-h-[140px]"
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-[rgb(var(--theme-border-rgb)/0.8)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">Profile changes are saved to your secure account immediately.</p>
                  <Button type="submit" className="min-w-40 rounded-full" disabled={savingProfile || uploadingAvatar}>
                    {savingProfile ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* OpsSync role & department (read-only) + Signature */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Role & Department */}
          <Card className="theme-panel border-0">
            <CardHeader className="pb-4">
              <CardTitle>OpsSync role & department</CardTitle>
              <CardDescription>Assigned by a system administrator. Contact admin to change.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  readOnly
                  value={
                    user?.opsync_role
                      ? user.opsync_role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                      : 'Employee'
                  }
                  className="h-11 rounded-2xl bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  readOnly
                  value={user?.department_name || 'Not assigned'}
                  className="h-11 rounded-2xl bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Signature */}
          <Card className="theme-panel border-0">
            <CardHeader className="pb-4">
              <CardTitle>Document signature</CardTitle>
              <CardDescription>
                Upload a PNG or JPG of your signature (max 500 KB). It appears on all printed requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={sigInputRef}
                type="file"
                accept={SIGNATURE_ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={handleSignatureChange}
              />
              {user?.signature ? (
                <div className="rounded-2xl border border-dashed border-[rgb(var(--theme-border-rgb)/0.8)] bg-white p-4 text-center">
                  <img
                    src={resolveApiAssetUrl(user.signature)}
                    alt="Your signature"
                    className="mx-auto max-h-20 object-contain"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">This is how your signature will appear on documents.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[rgb(var(--theme-border-rgb)/0.8)] bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                  No signature uploaded. Your printed name will be used instead.
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => sigInputRef.current?.click()}
                  disabled={uploadingSignature}
                >
                  {uploadingSignature ? (
                    <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><Camera className="mr-2 h-4 w-4" /> {user?.signature ? 'Replace' : 'Upload'} Signature</>
                  )}
                </Button>
                {user?.signature && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full text-destructive"
                    onClick={handleRemoveSignature}
                    disabled={uploadingSignature}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
