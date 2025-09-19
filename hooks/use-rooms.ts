"use client"

import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/firebase/firestore'
import { collection, doc, getDoc, onSnapshot, orderBy, query, where, type DocumentData } from 'firebase/firestore'
import { useAuth } from '@/hooks/use-auth'
import type { AnyRoom, RoomMember } from '@/lib/types/chat'

export function useRooms() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<AnyRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [lastReadAtByRoomId, setLastReadAtByRoomId] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!user) return
    // 1) Subscribe to membership list
    const q = query(collection(db, 'roomMembers'), where('uid', '==', user.uid))
    const unsub = onSnapshot(q, async (snap) => {
      const memberDocs = snap.docs
      // track lastReadAt per room
      const lastReadMap: Record<string, any> = {}
      for (const d of memberDocs) {
        const data = d.data() as DocumentData
        if (data.roomId) lastReadMap[data.roomId as string] = (data as any).lastReadAt ?? null
      }
      setLastReadAtByRoomId(lastReadMap)

      // 2) Subscribe to each room doc
      const unsubs: Array<() => void> = []
      const nextRooms: Record<string, AnyRoom> = {}
      for (const d of memberDocs) {
        const data = d.data() as DocumentData
        const roomId = data.roomId as string
        const u = onSnapshot(doc(db, 'rooms', roomId), (roomSnap) => {
          const rdata = { id: roomSnap.id, ...(roomSnap.data() as DocumentData) } as AnyRoom
          nextRooms[roomId] = rdata
          // Convert record to array
          setRooms(Object.values({ ...nextRooms }))
          setLoading(false)
        })
        unsubs.push(u)
      }
      return () => {
        unsubs.forEach((fn) => fn())
      }
    })
    return () => unsub()
  }, [user?.uid])

  // Sort rooms by lastMessageAt desc
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const at = (a.lastMessageAt as any)?.toMillis?.() ?? 0
      const bt = (b.lastMessageAt as any)?.toMillis?.() ?? 0
      return bt - at
    })
  }, [rooms])

  return { rooms: sortedRooms, lastReadAtByRoomId, loading }
}
