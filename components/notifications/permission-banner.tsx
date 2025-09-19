"use client"

import { useEffect, useState } from 'react'
import { useNotifications } from '@/components/providers/notifications-provider'
import { Button } from '@/components/ui/button'

export function NotificationPermissionBanner() {
  const { requestPermissionAndRegister } = useNotifications()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const supported = 'Notification' in window
    if (!supported) return
    if (Notification.permission === 'default') setVisible(true)
  }, [])
  if (!visible) return null
  return (
    <div className="mx-4 my-2 p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div className="text-sm font-medium mb-1">Enable notifications</div>
      <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-2">Get notified when new messages arrive, even if the app is closed.</div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { void requestPermissionAndRegister(); setVisible(false) }}>Allow notifications</Button>
        <Button size="sm" variant="outline" onClick={() => setVisible(false)}>Not now</Button>
      </div>
    </div>
  )
}
