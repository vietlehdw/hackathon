/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// This file is loaded at: `${NEXT_PUBLIC_PUSH_SW_PATH}` (default: /firebase-messaging-sw.js)

importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js')
// Load config from server (built from NEXT_PUBLIC_* env)
importScripts('/api/firebase-config.js')

if (typeof self.__FIREBASE_CONFIG !== 'undefined') {
  firebase.initializeApp(self.__FIREBASE_CONFIG)
  const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null

  if (messaging) {
    // Background messages handler
    messaging.onBackgroundMessage((payload) => {
      const title = payload?.notification?.title || 'New message'
      const body = payload?.notification?.body || ''
      const data = payload?.data || {}
      const options = {
        body,
        icon: '/favicon.ico',
        data,
        badge: '/favicon.ico',
      }
      self.registration.showNotification(title, options)
    })
  }
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = (event.notification?.data && event.notification.data.url) || '/chat'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
      return undefined
    }),
  )
})
