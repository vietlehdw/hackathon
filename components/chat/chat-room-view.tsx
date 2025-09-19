"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRoomMessages } from '@/hooks/use-room-messages'
import { MessageItem } from '@/components/chat/message-item'
import { MessageComposer } from '@/components/chat/message-composer'
import { getRoomMembers, inviteMembers, leaveRoom } from '@/lib/chat'
import { usePresence } from '@/hooks/use-presence'
import { useUsers } from '@/hooks/use-users'
import { TypingBanner } from '@/components/chat/typing-banner'
import { useTyping } from '@/hooks/use-typing'
import { PresenceBadge } from '@/components/chat/presence-badge'
import { useRoom } from '@/hooks/use-room'

export function ChatRoomView({ roomId }: { roomId: string }) {
  const { user } = useAuth()
  const room = useRoom(roomId)
  const { messages, loadMore, reachedEnd } = useRoomMessages(roomId)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [memberUids, setMemberUids] = useState<string[]>([])
  const [inviteText, setInviteText] = useState('')

  useEffect(() => {
    ;(async () => {
      const members = await getRoomMembers(roomId)
      setMemberUids(members.map((m) => m.uid))
    })()
  }, [roomId])

  const presenceMap = usePresence(memberUids)
  const usersMap = useUsers(memberUids)
  const { typingMap } = useTyping(roomId)

  const typingUids = useMemo(() => Object.entries(typingMap).filter(([uid, v]) => v).map(([uid]) => uid), [typingMap])

  // Compute display title
  const dmPeerUid = useMemo(() => {
    if (room?.type !== 'dm' || !user) return null
    return memberUids.find((uid) => uid !== user.uid) ?? null
  }, [room?.type, memberUids, user?.uid])
  const title = room?.type === 'group' ? (room?.name ?? 'Group') : (dmPeerUid ? (usersMap[dmPeerUid]?.displayName ?? 'Direct message') : 'Direct message')

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    // Update lastReadAt on new messages
    if (user && messages.length > 0) {
      void (async () => {
        const { markRoomRead } = await import('@/lib/chat')
        await markRoomRead(roomId, user.uid)
      })()
    }
  }, [messages.length, roomId, user?.uid])

  async function onInvite() {
    if (!inviteText.trim()) return
    const uids = inviteText.split(',').map((s) => s.trim()).filter(Boolean)
    await inviteMembers(roomId, user?.uid ?? '', uids)
    setInviteText('')
  }

  async function onLeave() {
    if (!user) return
    await leaveRoom(roomId, user.uid)
    window.location.href = '/chat'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 text-sm flex items-center gap-2">
        <div className="font-medium">{title}</div>
        <div className="text-neutral-500">{memberUids.length} members</div>
        <div className="ml-auto flex gap-2 items-center">
          {memberUids.map((uid) => (
            <PresenceBadge key={uid} online={(presenceMap[uid]?.state ?? 'offline') === 'online'} />
          ))}
        </div>
      </div>

      {room?.type === 'group' && (
        <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex gap-2 items-center">
          <input className="flex-1 text-sm bg-transparent border px-2 py-1 rounded" placeholder="Invite by UID (comma-separated)" value={inviteText} onChange={(e) => setInviteText(e.target.value)} />
          <button className="text-sm px-3 py-1 rounded bg-neutral-200 dark:bg-neutral-800" onClick={() => void onInvite()}>Invite</button>
          <button className="text-sm px-3 py-1 rounded bg-red-600 text-white" onClick={() => void onLeave()}>Leave</button>
        </div>
      )}

      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {!reachedEnd && (
          <button className="text-xs text-neutral-500 hover:underline" onClick={() => void loadMore()}>Load older messages</button>
        )}
        {messages.map((m) => (
          <MessageItem key={m.id} msg={m} isOwn={m.senderId === user?.uid} sender={{
            uid: m.senderId,
            displayName: usersMap[m.senderId]?.displayName,
            username: usersMap[m.senderId]?.username,
            photoURL: usersMap[m.senderId]?.photoURL ?? null,
          }} />
        ))}
      </div>

      <TypingBanner typingUids={typingUids.filter((u) => u !== user?.uid)} namesByUid={Object.fromEntries(Object.entries(usersMap).map(([uid, u]) => [uid, u.displayName]))} />
      <MessageComposer roomId={roomId} />
    </div>
  )
}
