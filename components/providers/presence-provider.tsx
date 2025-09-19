"use client"

import { useEffect } from 'react'
import { onDisconnect, onValue, ref, serverTimestamp, set, update } from 'firebase/database'
import { rtdb } from '@/lib/firebase/rtdb'
import { useAuth } from '@/hooks/use-auth'

export function PresenceProvider() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    const statusRef = ref(rtdb, `/status/${uid}`)
    const connectedRef = ref(rtdb, '.info/connected')

    // Set online when connected; ensure offline on disconnect
    const unsub = onValue(connectedRef, async (snap) => {
      if (snap.val() === false) {
        return
      }
      try {
        await onDisconnect(statusRef).set({ state: 'offline', lastChanged: Date.now() })
        await set(statusRef, { state: 'online', lastChanged: Date.now() })
      } catch {
        // ignore
      }
    })

    // Update lastChanged on visibility changes
    const onVis = () => {
      const state = document.visibilityState === 'visible' ? 'online' : 'offline'
      void update(statusRef, { state, lastChanged: Date.now() })
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onVis)
    window.addEventListener('blur', onVis)

    return () => {
      unsub()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', onVis)
      window.removeEventListener('blur', onVis)
    }
  }, [user])

  return null
}
