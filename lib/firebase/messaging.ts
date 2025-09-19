import { isSupported, getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'
import { getFirebaseApp } from './app'

let messaging: Messaging | null = null

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messaging) return messaging
  const supported = await isSupported().catch(() => false)
  if (!supported) return null
  messaging = getMessaging(getFirebaseApp())
  return messaging
}

export async function getFcmToken(): Promise<string | null> {
  const m = await getFirebaseMessaging()
  if (!m) return null
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) return null
  try {
    const token = await getToken(m, { vapidKey })
    return token ?? null
  } catch (e) {
    return null
  }
}

export { onMessage }
