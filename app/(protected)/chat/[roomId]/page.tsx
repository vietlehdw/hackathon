"use client"

import { ChatRoomView } from '@/components/chat/chat-room-view'
import { useParams } from 'next/navigation'

export default function RoomPage() {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId
  return (
    <div className="h-[calc(100vh-70px)]">
      <ChatRoomView roomId={roomId} />
    </div>
  )
}
