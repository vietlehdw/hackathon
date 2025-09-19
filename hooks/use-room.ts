"use client"

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase/firestore'
import { doc, onSnapshot } from 'firebase/firestore'
import type { AnyRoom } from '@/lib/types/chat'

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<AnyRoom | null>(null)

  useEffect(() => {
    if (!roomId) return
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      setRoom({ id: snap.id, ...(snap.data() as any) })
    })
    return () => unsub()
  }, [roomId])

  return room
}
