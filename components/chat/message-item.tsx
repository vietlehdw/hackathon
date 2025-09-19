"use client"

import type { Message } from '@/lib/types/chat'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function MessageItem({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <div className={cn('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[70%] rounded-lg px-3 py-2', isOwn ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100')}>
        {msg.type === 'text' && (
          <div className="whitespace-pre-wrap break-words text-sm">{msg.text}</div>
        )}
        {msg.type === 'image' && msg.imageURL && (
          <a href={msg.imageURL} target="_blank" rel="noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={msg.imageURL} alt="Image" className="rounded-md max-h-64 object-contain" />
          </a>
        )}
      </div>
    </div>
  )
}
