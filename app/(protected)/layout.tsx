"use client"

import { useRequireAuth } from '@/hooks/use-require-auth'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PresenceProvider } from '@/components/providers/presence-provider'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth()
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && user && !user.displayName && pathname !== '/setup-profile') {
      router.replace('/setup-profile')
    }
  }, [loading, user, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-semibold">Hackathon App</div>
        <Button variant="outline" size="sm" onClick={() => void logout()}>Logout</Button>
      </header>
      <main className="flex-1">{children}</main>
      <PresenceProvider />
    </div>
  )
}
