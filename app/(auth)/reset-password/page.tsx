"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const ResetSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

type ResetValues = z.infer<typeof ResetSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const { sendPasswordResetEmail } = useAuth()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<ResetValues>({
    resolver: zodResolver(ResetSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  })

  const email = watch('email')

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await sendPasswordResetEmail(values.email)
      setSent(true)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send reset email')
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm text-neutral-700">If an account exists for {email}, you will receive an email with a password reset link.</p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-red-600" role="alert">{errors.email.message}</p>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-600" role="alert">{error}</p>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Sending...' : 'Send reset email'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-neutral-600">
          <a href="/login" className="hover:underline">Back to login</a>
        </CardFooter>
      </Card>
    </div>
  )
}
