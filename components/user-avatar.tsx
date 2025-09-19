"use client"

import Link from 'next/link'
import { cn } from '@/lib/utils'

export type UserAvatarProps = {
  uid: string
  displayName?: string
  username?: string
  photoURL?: string | null
  size?: number // px
  className?: string
  clickable?: boolean
}

function getInitials(name?: string, username?: string): string {
  const src = (name && name.trim()) || (username && username.trim()) || ''
  if (!src) return '?'
  const parts = src.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function UserAvatar({ uid, displayName, username, photoURL, size = 32, className, clickable = true }: UserAvatarProps) {
  const content = (
    <span
      className={cn('inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-700 overflow-hidden', className)}
      style={{ width: size, height: size }}
      aria-label={displayName || username || 'user'}
    >
      {photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoURL} alt={displayName || username || 'user'} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] font-medium">{getInitials(displayName, username)}</span>
      )}
    </span>
  )
  if (!clickable) return content
  return (
    <Link href={`/profile/${uid}`} className="inline-block" prefetch>
      {content}
    </Link>
  )
}
