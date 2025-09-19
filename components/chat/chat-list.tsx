"use client"

import Link from 'next/link'
import { useRooms } from '@/hooks/use-rooms'
import type { AnyRoom } from '@/lib/types/chat'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useMemo, useState } from 'react'
import { searchUsersByName } from '@/lib/users'
import { createOrOpenDMRoom } from '@/lib/chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { usePresence } from '@/hooks/use-presence'
import { useUsers } from '@/hooks/use-users'

function RoomPreview({ room, currentUid }: { room: AnyRoom; currentUid: string | undefined }) {
  const href = `/chat/${room.id}`
  const preview = room.lastMessageType === 'image' ? '[Image]' : (room.lastMessageText ?? '')
  let peerUid: string | null = null
  if (room.type === 'dm' && room.id.startsWith('dm_') && currentUid) {
    const parts = room.id.replace('dm_', '').split('_')
    peerUid = parts[0] === currentUid ? parts[1] : parts[0]
  }
  const presence = usePresence(peerUid ? [peerUid] : [])
  const usersMap = useUsers(peerUid ? [peerUid] : null)
  const online = peerUid ? (presence[peerUid]?.state ?? 'offline') === 'online' : false
  const title = room.type === 'group' ? (room.name ?? 'Group') : (peerUid ? (usersMap[peerUid]?.displayName ?? 'Direct message') : 'Direct message')
  return (
    <Link href={href} className="block px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="font-medium text-sm flex items-center gap-2">
        {title}
        {room.type === 'dm' && <span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400 opacity-70'}`} />}
      </div>
      <div className="text-xs text-neutral-500 truncate">{preview}</div>
    </Link>
  )
}

export function ChatList() {
  const { rooms, loading } = useRooms()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ uid: string; displayName: string }>>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return }
      setSearching(true)
      try {
        const r = await searchUsersByName(query.trim(), 8)
        setResults(r.filter((u) => u.uid !== user?.uid).map((u) => ({ uid: u.uid, displayName: u.displayName })))
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, user?.uid])

  async function startDM(peerUid: string) {
    if (!user) return
    if (peerUid === user.uid) return
    const room = await createOrOpenDMRoom(user.uid, peerUid)
    window.location.href = `/chat/${room.id}`
  }

  return (
    <div className="flex h-full">
      <div className="w-full max-w-md border-r border-neutral-200 dark:border-neutral-800">
        <div className="p-3 flex gap-2">
          <Input placeholder="Search users to DM" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Link href="/chat/new-group"><Button variant="outline">New Group</Button></Link>
        </div>
        {searching && <div className="px-3 text-xs text-neutral-500">Searching…</div>}
        {results.length > 0 && (
          <div className="px-3 py-2">
            <div className="text-xs text-neutral-500 mb-1">Start a DM</div>
            <div className="space-y-1">
              {results.map((u) => (
                <button key={u.uid} onClick={() => void startDM(u.uid)} className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900">
                  {u.displayName}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="text-xs text-neutral-500 px-4 py-2">Your chats</div>
        {loading && <div className="px-4 py-2 text-xs text-neutral-500">Loading…</div>}
        <div>
          {rooms.map((r) => <RoomPreview key={r.id} room={r} currentUid={user?.uid} />)}
        </div>
      </div>
      <div className="flex-1 hidden md:flex items-center justify-center text-neutral-500">
        Select a chat
      </div>
    </div>
  )
}
