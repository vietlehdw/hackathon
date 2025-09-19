import { getFirebaseMessaging, getFcmToken } from '@/lib/firebase/messaging'
import { db, serverTimestamp } from '@/lib/firebase/firestore'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

const TOKEN_STORAGE_KEY = 'fcm_token'

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
  const swPath = process.env.NEXT_PUBLIC_PUSH_SW_PATH || '/firebase-messaging-sw.js'
  try {
    const reg = await navigator.serviceWorker.register(swPath)
    return reg
  } catch (e) {
    console.warn('Service worker registration failed', e)
    return null
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') return 'default'
  if (!('Notification' in window)) return 'denied'
  const perm = await Notification.requestPermission()
  return perm
}

export async function ensureFcmToken(uid: string): Promise<string | null> {
  // Register SW first
  const swReg = await registerServiceWorker()
  // Initialize messaging
  const m = await getFirebaseMessaging()
  if (!m) return null

  // Get or create token
  let token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) {
    token = await getFcmToken()
  }
  if (!token) return null

  // Persist locally
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  // Store in Firestore (id = token)
  await setDoc(doc(db, 'notificationTokens', token), {
    uid,
    token,
    platform: 'web',
    createdAt: serverTimestamp(),
  }, { merge: true })
  // Also notify server endpoint for future admin-side processing
  try {
    await fetch('/api/notifications/register-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
  } catch {}
  return token
}

export async function deleteFcmTokenAndUnregister(uid?: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const { deleteToken } = await import('firebase/messaging')
    const m = await getFirebaseMessaging()
    if (m) {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
      try {
        await deleteToken(m)
      } catch {}
      if (stored) {
        try { await deleteDoc(doc(db, 'notificationTokens', stored)) } catch {}
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    }
  } catch {
    // ignore
  }
}
