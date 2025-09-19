# Cloud Function: Send Push on New Message (Example)

This example shows a Firebase Cloud Function (TypeScript) to send FCM notifications when a new message is written. Deploy this in a separate Firebase Functions project. It is not used by the Next.js app directly.

```ts
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp()
const db = admin.firestore()

export const onMessageCreate = functions.firestore.document('messages/{messageId}').onCreate(async (snap, ctx) => {
  const msg = snap.data() as { roomId: string; senderId: string; type: 'text' | 'image'; text?: string | null; createdAt: admin.firestore.Timestamp }
  const roomId = msg.roomId
  const senderId = msg.senderId

  // Get room members excluding sender
  const membersSnap = await db.collection('roomMembers').where('roomId', '==', roomId).get()
  const memberUids = membersSnap.docs.map((d) => d.get('uid') as string).filter((uid) => uid !== senderId)
  if (memberUids.length === 0) return

  // Fetch tokens for these uids
  const tokensSnap = await db.collection('notificationTokens').where('uid', 'in', memberUids.slice(0, 10)).get() // Firestore 'in' limit 10
  const tokens: string[] = tokensSnap.docs.map((d) => d.get('token') as string)
  if (tokens.length === 0) return

  // Build notification
  const body = msg.type === 'image' ? 'sent an image' : (msg.text || '').slice(0, 140)
  const payload: admin.messaging.MessagingPayload = {
    notification: {
      title: 'New message',
      body,
    },
    data: {
      roomId,
      url: `/chat/${roomId}`,
    },
  }

  const res = await admin.messaging().sendEachForMulticast({ tokens, notification: payload.notification, data: payload.data })

  // Cleanup invalid tokens
  const removals: Promise<any>[] = []
  res.responses.forEach((r, idx) => {
    if (!r.success) {
      const code = (r.error as any)?.code
      if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
        const t = tokens[idx]
        removals.push(db.collection('notificationTokens').doc(t).delete().catch(() => {}))
      }
    }
  })
  await Promise.all(removals)
})
```
