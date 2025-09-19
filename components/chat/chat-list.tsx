"use client"

import Link from 'next/link'
import { useRooms } from '@/hooks/use-rooms'
import type { AnyRoom } from '@/lib/types/chat'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useMemo, useState } from 'react'
import { searchUsersByName } from '@/lib/users'
import { createGroupRoom, createOrOpenDMRoom } from '@/lib/chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

import { usePresence } from '@/hooks/use-presence'
import { useUsers } from '@/hooks/use-users'
import { UserAvatar } from '@/components/user-avatar'
import { NotificationPermissionBanner } from '@/components/notifications/permission-banner'

function RoomPreview({ room, currentUid, lastReadAt, isActive }: { room: AnyRoom; currentUid: string | undefined; lastReadAt: any | null; isActive: boolean }) {
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
  const user = peerUid ? usersMap[peerUid] : undefined
  const lastMessageAtMs = (room.lastMessageAt as any)?.toMillis?.() ?? 0
  const lastReadMs = (lastReadAt as any)?.toMillis?.() ?? 0
  const lastSenderId = room.lastMessageSenderId ?? null
  const isSelfLastMessage = currentUid ? lastSenderId === currentUid : false
  const hasUnread = !isSelfLastMessage && lastMessageAtMs > lastReadMs
  const showUnread = !isActive && hasUnread
  return (
    <Link
      href={href}
      className={`block px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${isActive ? 'bg-neutral-100 dark:bg-neutral-900' : ''}`}
    >
      <div className={`text-sm flex items-center gap-2 ${isActive ? 'font-semibold' : 'font-medium'}`}>
        {peerUid && (
          <UserAvatar uid={peerUid} displayName={user?.displayName} username={user?.username} photoURL={user?.photoURL} size={20} clickable={false} />
        )}
        {title}
        {room.type === 'dm' && <span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400 opacity-70'}`} />}
        {showUnread && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white">1</span>}
      </div>
      <div className="text-xs text-neutral-500 truncate">{preview}</div>
    </Link>
  )
}

function NewGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ uid: string; displayName: string }>>([])
  const [selected, setSelected] = useState<Record<string, { uid: string; displayName: string }>>({})
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return }
      const r = await searchUsersByName(query.trim(), 8)
      setResults(r.filter((u) => u.uid !== user?.uid).map((u) => ({ uid: u.uid, displayName: u.displayName })))
    }, 300)
    return () => clearTimeout(t)
  }, [open, query, user?.uid])

  function toggle(uid: string, displayName: string) {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[uid]) delete next[uid]
      else next[uid] = { uid, displayName }
      return next
    })
  }

  async function onCreate() {
    if (!user) return
    if (!name.trim()) return
    const memberUids = Object.keys(selected)
    if (memberUids.length === 0) return
    try {
      setCreating(true)
      const room = await createGroupRoom(user.uid, name.trim(), memberUids)
      window.location.href = `/chat/${room.id}`
    } finally {
      setCreating(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative bg-white dark:bg-neutral-950 rounded-lg shadow-lg w-full max-w-md mx-4 p-4">
        <div className="text-lg font-semibold mb-3">New Group</div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm">Group name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hackathon Team" />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Add members</label>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users by name" />
            <div className="space-y-1 max-h-64 overflow-auto">
              {results.map((u) => (
                <button key={u.uid} onClick={() => toggle(u.uid, u.displayName)} className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900">
                  <input type="checkbox" className="mr-2" readOnly checked={Boolean(selected[u.uid])} />
                  {u.displayName}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={creating}>Cancel</Button>
            <Button onClick={() => void onCreate()} disabled={creating || !name.trim() || Object.keys(selected).length === 0}>Create Group</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

type ChatListProps = { mode?: 'standalone' | 'sidebar' }

export function ChatList({ mode = 'standalone' }: ChatListProps) {
  const { rooms, lastReadAtByRoomId, loading } = useRooms()
  const { user } = useAuth()
  const pathname = usePathname()
  const activeRoomId = useMemo(() => {
    if (!pathname) return null
    const m = pathname.match(/^\/chat\/(.+)$/)
    return m ? decodeURIComponent(m[1]) : null
  }, [pathname])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ uid: string; displayName: string; username?: string; photoURL?: string | null }>>([])
  const [searching, setSearching] = useState(false)
  const [newGroupOpen, setNewGroupOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return }
      setSearching(true)
      try {
        const r = await searchUsersByName(query.trim(), 8)
        setResults(r.filter((u) => u.uid !== user?.uid).map((u) => ({ uid: u.uid, displayName: u.displayName, username: u.username, photoURL: u.photoURL })))
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

  const listContent = (
    <div className="w-full max-w-md border-r border-neutral-200 dark:border-neutral-800">
      <div className="p-3 flex gap-2">
        <Input placeholder="Search users to DM" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button className='whitespace-nowrap' onClick={() => setNewGroupOpen(true)}>New Group</Button>
      </div>
      {searching && <div className="px-3 text-xs text-neutral-500">Searching…</div>}
      <NotificationPermissionBanner />
      {results.length > 0 && (
        <div className="px-3 py-2">
          <div className="text-xs text-neutral-500 mb-1">Start a DM</div>
          <div className="space-y-1">
            {results.map((u) => (
              <button key={u.uid} onClick={() => void startDM(u.uid)} className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2">
                <UserAvatar uid={u.uid} displayName={u.displayName} username={u.username} photoURL={u.photoURL ?? null} size={20} />
                <span className="text-sm">
                  {u.displayName}
                  {u.username ? <span className="text-neutral-500"> · @{u.username}</span> : null}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="text-xs text-neutral-500 px-4 py-2">Your chats</div>
      {loading && <div className="px-4 py-2 text-xs text-neutral-500">Loading…</div>}
      <div>
        {rooms.map((r) => <RoomPreview key={r.id} room={r} currentUid={user?.uid} lastReadAt={lastReadAtByRoomId[r.id] ?? null} isActive={activeRoomId === r.id} />)}
      </div>
      <NewGroupModal open={newGroupOpen} onClose={() => setNewGroupOpen(false)} />
    </div>
  )

  if (mode === 'sidebar') {
    return listContent
  }

  return (
    <div className="flex h-full">
      {listContent}
      <div className="flex-1 hidden md:flex items-center justify-center text-neutral-500">
        Select a chat
      </div>
    </div>
  )
}
