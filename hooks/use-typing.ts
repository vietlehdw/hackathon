"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { onValue, ref, set } from 'firebase/database'
import { rtdb } from '@/lib/firebase/rtdb'
import { useAuth } from '@/hooks/use-auth'

export function useTyping(roomId: string | null) {
  const { user } = useAuth()
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({})
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Subscribe to all typing flags under this room
  useEffect(() => {
    if (!roomId) return
    const roomTypingRef = ref(rtdb, `/typing/${roomId}`)
    const unsub = onValue(roomTypingRef, (snap) => {
      setTypingMap(snap.val() ?? {})
    })
    return () => unsub()
  }, [roomId])

  // Set typing true immediately, schedule debounce false after 2s
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!user || !roomId) return
      const myRef = ref(rtdb, `/typing/${roomId}/${user.uid}`)
      if (isTyping) {
        void set(myRef, true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          void set(myRef, false)
        }, 2000)
      } else {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        void set(myRef, false)
      }
    },
    [user?.uid, roomId],
  )

  const stopTypingNow = useCallback(() => setTyping(false), [setTyping])

  return { typingMap, setTyping, stopTypingNow }
}
