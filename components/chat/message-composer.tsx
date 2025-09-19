"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { sendImageMessage, sendTextMessage } from '@/lib/chat'
import { uploadRoomImage } from '@/lib/upload'
import { useTyping } from '@/hooks/use-typing'
import { Send } from 'lucide-react'

export function MessageComposer({ roomId }: { roomId: string }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { setTyping, stopTypingNow } = useTyping(roomId)
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function onSend() {
    if (!user) return
    const t = text.trim()
    if (!t) return
    try {
      setSending(true)
      await sendTextMessage(roomId, user.uid, t)
      setText('')
      stopTypingNow()
      // Refocus input after sending
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadRoomImage(roomId, file)
      await sendImageMessage(roomId, user.uid, url)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex gap-2 items-center p-2 border-t border-neutral-200 dark:border-neutral-800">
      <label className="text-sm px-3 py-2 rounded-md bg-neutral-200 dark:bg-neutral-800 cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
        {uploading ? 'Uploading…' : 'Image'}
      </label>
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => { setText(e.target.value); setTyping(Boolean(e.target.value)) }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            void onSend()
          } else {
            setTyping(true)
          }
        }}
        placeholder="Type a message"
        className="flex-1"
        disabled={sending}
      />
      <Button onClick={() => void onSend()} disabled={sending || text.trim().length === 0} className='flex gap-2'>
        <Send className="w-4 h-4" />
        <span>Send</span>
      </Button>
    </div>
  )
}
