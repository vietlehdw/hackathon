"use client"

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase/firestore'
import { doc, getDoc } from 'firebase/firestore'
import type { UserProfile } from '@/lib/types/chat'

export function useUsers(uids: string[] | null) {
  const [users, setUsers] = useState<Record<string, UserProfile>>({})

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!uids || uids.length === 0) return
      const entries: Record<string, UserProfile> = {}
      for (const uid of uids) {
        const s = await getDoc(doc(db, 'users', uid))
        if (s.exists()) entries[uid] = s.data() as UserProfile
      }
      if (mounted) setUsers(entries)
    })()
    return () => { mounted = false }
  }, [JSON.stringify(uids)])

  return users
}
