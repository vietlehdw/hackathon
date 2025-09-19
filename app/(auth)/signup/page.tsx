"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const SignupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignupValues = z.infer<typeof SignupSchema>

function SignupInner() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/'
  const { user, loading, signUpWithEmail, signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (!loading && user) router.replace(next)
  }, [loading, user, router, next])

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await signUpWithEmail(values.email, values.password)
      router.replace(next)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to sign up')
    }
  })

  async function onGoogle() {
    setError(null)
    try {
      await signInWithGoogle()
      // Redirect will occur via auth state change
    } catch (e: any) {
      setError(e?.message ?? 'Google sign-in failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} placeholder='Enter your email' />
              {errors.email && (
                <p className="text-sm text-red-600" role="alert">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} placeholder='Enter your password' />
              {errors.password && (
                <p className="text-sm text-red-600" role="alert">{errors.password.message}</p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <div className="mt-4">
            <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={isSubmitting}>
              Continue with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-neutral-600">
          <a href="/login" className="hover:underline">Have an account? Sign in</a>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  )
}
