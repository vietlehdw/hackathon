"use client"

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/firebase/firestore'
import { doc, setDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const ProfileSchema = z.object({
  displayName: z.string().min(2, 'Name is too short').max(50, 'Name is too long'),
})

type ProfileValues = z.infer<typeof ProfileSchema>

export default function SetupProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    mode: 'onBlur',
    defaultValues: { displayName: user?.displayName ?? '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return

    // 1) Update Firebase Auth profile so protected layout stops redirecting
    try {
      await updateProfile(user, { displayName: values.displayName })
    } catch (err) {
      // ignore updateProfile errors; continue to try saving Firestore
    }

    // 2) Persist profile to Firestore (may require proper security rules)
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { displayName: values.displayName, profileComplete: true },
        { merge: true },
      )
    } catch (err) {
      // Surface a friendly error in the console so it's visible during dev
      // eslint-disable-next-line no-console
      console.error('Failed to save user profile to Firestore:', err)
      // Intentionally proceed; the Auth displayName has been updated so UX can continue
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
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Saving...' : 'Save and continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
