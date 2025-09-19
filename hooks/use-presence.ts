"use client"

import { useEffect, useMemo, useState } from 'react'
import { onValue, ref } from 'firebase/database'
import { rtdb } from '@/lib/firebase/rtdb'

export type PresenceState = 'online' | 'offline'

export function usePresence(uids: string[] | null) {
  const [map, setMap] = useState<Record<string, { state: PresenceState; lastChanged: number }>>({})

  useEffect(() => {
    if (!uids || uids.length === 0) return
    const unsubs = uids.map((uid) => {
      const statusRef = ref(rtdb, `/status/${uid}`)
      return onValue(statusRef, (snap) => {
        const v = snap.val() as { state: PresenceState; lastChanged: number } | null
        setMap((prev) => ({ ...prev, [uid]: v ?? { state: 'offline', lastChanged: 0 } }))
      })
    })
    return () => {
      unsubs.forEach((u) => u())
    }
  }, [JSON.stringify(uids)])

  return map
}
