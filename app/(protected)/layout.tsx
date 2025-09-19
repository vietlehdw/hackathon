"use client"

import { useRequireAuth } from '@/hooks/use-require-auth'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PresenceProvider } from '@/components/providers/presence-provider'
import { ChatList } from '@/components/chat/chat-list'
import { UserAvatar } from '@/components/user-avatar'
import ProfileEditModal from '@/components/profile-edit-modal'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth()
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)

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
        <div className="flex items-center gap-3">
          {user && (
            <button className="flex items-center" onClick={() => setProfileOpen(true)} aria-label="Edit profile">
              <UserAvatar uid={user.uid} displayName={user.displayName ?? undefined} photoURL={user.photoURL ?? null} size={28} clickable={false} />
            </button>
          )}
          <Button variant="outline" size="sm" onClick={() => void logout()}>Logout</Button>
        </div>
      </header>
      <main className="flex-1 flex min-h-0">
        <div className="hidden md:block w-full max-w-md border-r border-neutral-200 dark:border-neutral-800">
          <div className="h-[calc(100vh-70px)]">
            <ChatList mode="sidebar" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </main>
      <PresenceProvider />
      <ProfileEditModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
