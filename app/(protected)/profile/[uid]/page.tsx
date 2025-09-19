"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firestore'
import type { UserProfile } from '@/lib/types/chat'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { createOrOpenDMRoom } from '@/lib/chat'

export default function ProfilePage() {
  const params = useParams<{ uid: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const uid = params.uid
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const s = await getDoc(doc(db, 'users', uid))
        if (mounted) setProfile(s.exists() ? (s.data() as UserProfile) : null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [uid])

  async function startDM() {
    if (!user || !profile) return
    const room = await createOrOpenDMRoom(user.uid, profile.uid)
    router.push(`/chat/${room.id}`)
  }

  if (loading) return <div className="p-6 text-sm text-neutral-500">Loading…</div>
  if (!profile) return <div className="p-6 text-sm text-neutral-500">User not found</div>

  const isSelf = user?.uid === profile.uid

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4">
        <UserAvatar uid={profile.uid} displayName={profile.displayName} username={profile.username} photoURL={profile.photoURL} size={64} clickable={false} />
        <div>
          <div className="text-xl font-semibold">{profile.displayName}</div>
          <div className="text-neutral-500">@{profile.username}</div>
        </div>
      </div>
      {profile.bio && <div className="mt-4 text-sm">{profile.bio}</div>}
      <div className="mt-6 flex gap-2">
        {!isSelf && (
          <Button onClick={() => void startDM()}>Start DM</Button>
        )}
      </div>
    </div>
  )
}
