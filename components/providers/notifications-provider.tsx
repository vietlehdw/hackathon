"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { MessagePayload } from 'firebase/messaging'
import { useAuth } from '@/hooks/use-auth'
import { ensureFcmToken, requestNotificationPermission } from '@/lib/notifications'

export type InAppNotification = {
  id: string
  title: string
  body?: string
  url?: string
}

export type NotificationsContextValue = {
  banners: InAppNotification[]
  dismiss: (id: string) => void
  requestPermissionAndRegister: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

function InAppBanner({ n, onClick, onClose }: { n: InAppNotification; onClick: () => void; onClose: () => void }) {
  return (
    <div className="pointer-events-auto max-w-sm w-full rounded-md shadow-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3">
      <div className="text-sm font-medium mb-1">{n.title}</div>
      {n.body && <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-2">{n.body}</div>}
      <div className="flex gap-2 justify-end">
        <button className="text-xs px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800" onClick={onClose}>Dismiss</button>
        <button className="text-xs px-2 py-1 rounded bg-black text-white dark:bg-white dark:text-black" onClick={onClick}>Open</button>
      </div>
    </div>
  )
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [banners, setBanners] = useState<InAppNotification[]>([])

  useEffect(() => {
    // Foreground FCM handler
    let remove: (() => void) | undefined
    ;(async () => {
      try {
        const m = await import('firebase/messaging')
        const messaging = await (await import('@/lib/firebase/messaging')).getFirebaseMessaging()
        if (!messaging) return
        remove = m.onMessage(messaging, (payload: MessagePayload) => {
          const title = payload?.notification?.title || 'New message'
          const body = payload?.notification?.body
          const url = (payload?.data as any)?.url
          const id = Math.random().toString(36).slice(2)
          setBanners((prev) => [...prev, { id, title, body, url }])
        })
      } catch {
        // ignore
      }
    })()
    return () => { remove?.() }
  }, [])

  const dismiss = (id: string) => setBanners((prev) => prev.filter((b) => b.id !== id))

  const requestPermissionAndRegister = useMemo(() => {
    return async () => {
      if (!user) return
      const perm = await requestNotificationPermission()
      if (perm !== 'granted') return
      await ensureFcmToken(user.uid)
    }
  }, [user?.uid])

  return (
    <NotificationsContext.Provider value={{ banners, dismiss, requestPermissionAndRegister }}>
      {children}
      {/* Banner stack */}
      <div className="fixed right-4 top-4 z-50 space-y-2 pointer-events-none">
        {banners.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <InAppBanner n={n} onClose={() => dismiss(n.id)} onClick={() => { if (n.url) window.location.href = n.url; dismiss(n.id) }} />
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within <NotificationsProvider>')
  return ctx
}
