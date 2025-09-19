"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Message } from '@/lib/types/chat'
import { fetchOlderMessages, subscribeToLatestMessages } from '@/lib/chat'
import type { DocumentData } from 'firebase/firestore'

export function useRoomMessages(roomId: string | null, pageSize = 30) {
  const [messages, setMessages] = useState<Message[]>([])
  const [cursor, setCursor] = useState<DocumentData | null>(null)
  const [reachedEnd, setReachedEnd] = useState(false)

  useEffect(() => {
    if (!roomId) return
    const unsub = subscribeToLatestMessages({
      roomId,
      pageSize,
      onUpdate: (msgs, { cursor, reachedEnd }) => {
        setMessages(msgs)
        setCursor(cursor)
        setReachedEnd(reachedEnd)
      },
    })
    return () => unsub()
  }, [roomId, pageSize])

  const loadMore = useCallback(async () => {
    if (!roomId || reachedEnd) return { appended: 0 }
    const res = await fetchOlderMessages(roomId, cursor, pageSize)
    setMessages((prev) => [...prev, ...res.messages])
    setCursor(res.newCursor)
    setReachedEnd(res.reachedEnd)
    return { appended: res.messages.length }
  }, [roomId, cursor, pageSize, reachedEnd])

  // Expose messages in chronological order (oldest -> newest)
  const chronological = useMemo(() => [...messages].reverse(), [messages])

  return { messages: chronological, loadMore, reachedEnd }
}
