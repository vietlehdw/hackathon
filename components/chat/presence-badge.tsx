"use client"

import { cn } from '@/lib/utils'

export function PresenceBadge({ online }: { online: boolean }) {
  return (
    <span className={cn(
      'inline-block w-2.5 h-2.5 rounded-full',
      online ? 'bg-green-500' : 'bg-gray-400 opacity-70',
    )} />
  )
}
