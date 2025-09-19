"use client"

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db, serverTimestamp } from '@/lib/firebase/firestore'
import { doc, getDoc, runTransaction } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { uploadUserAvatar } from '@/lib/upload'

const usernameRegex = /^[a-z0-9_\-]{3,20}$/

const ProfileSchema = z.object({
  displayName: z.string().min(2, 'Name is too short').max(50, 'Name is too long'),
  username: z.string().toLowerCase().regex(usernameRegex, '3-20 chars, lowercase letters, numbers, _ or - only'),
  bio: z.string().max(160, 'Bio is too long'),
})

type ProfileValues = z.infer<typeof ProfileSchema>

type Availability = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'

export default function SetupProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setError } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    mode: 'onChange',
    defaultValues: { displayName: user?.displayName ?? '', bio: '', username: '' },
  })

  const [availability, setAvailability] = useState<Availability>('idle')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const username = watch('username')

  useEffect(() => {
    if (!username) { setAvailability('idle'); return }
    if (!usernameRegex.test(username)) { setAvailability('invalid'); return }
    let canceled = false
    setAvailability('checking')
    const t = setTimeout(async () => {
      try {
        const ref = doc(db, 'usernames', username)
        const snap = await getDoc(ref)
        if (!canceled) setAvailability(snap.exists() ? 'unavailable' : 'available')
      } catch {
        if (!canceled) setAvailability('idle')
      }
    }, 300)
    return () => { canceled = true; clearTimeout(t) }
  }, [username])

  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(null); return }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return

    // Validate availability before proceeding
    if (!usernameRegex.test(values.username)) {
      setError('username', { message: 'Invalid username format' })
      return
    }
    if (availability === 'unavailable' || availability === 'checking') {
      setError('username', { message: 'Username not available' })
      return
    }

    let photoURL: string | null = null
    // 1) Upload avatar if provided
    try {
      if (avatarFile) {
        photoURL = await uploadUserAvatar(user.uid, avatarFile)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Avatar upload failed', err)
      // Keep going without photo
    }

    // 2) Transaction: reserve username and write user doc
    try {
      await runTransaction(db, async (tx) => {
        const unameRef = doc(db, 'usernames', values.username)
        const unameSnap = await tx.get(unameRef)
        if (unameSnap.exists() && unameSnap.data()?.uid !== user.uid) {
          throw new Error('USERNAME_TAKEN')
        }
        tx.set(unameRef, { uid: user.uid })

        const userRef = doc(db, 'users', user.uid)
        const now = serverTimestamp()
        tx.set(userRef, {
          uid: user.uid,
          email: user.email ?? null,
          displayName: values.displayName,
          username: values.username,
          photoURL: photoURL ?? (user.photoURL ?? null),
          bio: values.bio ?? '',
          createdAt: now,
          updatedAt: now,
          profileComplete: true,
        }, { merge: true })
      })
    } catch (err) {
      setError('username', { message: 'Username already taken. Please choose another.' })
      return
    }

    // 3) Update Firebase Auth profile for immediate UX
    try {
      await updateProfile(user, { displayName: values.displayName, photoURL: photoURL ?? undefined })
    } catch {
      // ignore
    }

    router.replace('/')
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Complete your profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" {...register('displayName')} />
              {errors.displayName && (
                <p className="text-sm text-red-600" role="alert">{errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="yourname" {...register('username')} />
              <div className="text-xs h-4">
                {availability === 'checking' && <span className="text-neutral-500">Checking…</span>}
                {availability === 'available' && <span className="text-green-600">Available</span>}
                {availability === 'unavailable' && <span className="text-red-600">Unavailable</span>}
                {availability === 'invalid' && <span className="text-red-600">Invalid format</span>}
              </div>
              {errors.username && (
                <p className="text-sm text-red-600" role="alert">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" placeholder="A short bio" {...register('bio')} />
              {errors.bio && (
                <p className="text-sm text-red-600" role="alert">{errors.bio.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="avatar">Avatar</Label>
              <input id="avatar" type="file" accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setAvatarFile(file)
                }}
              />
              {avatarPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="Preview" className="mt-2 w-16 h-16 rounded-full object-cover" />
              )}
            </div>

            <Button type="submit" disabled={isSubmitting || availability === 'checking'} className="w-full">
              {isSubmitting ? 'Saving…' : 'Save and continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
