# Push Notifications — Technical Specification

## Feature Requirements
- Push notifications for new messages (foreground and background).
- Badge counts for unread messages.

## Technical Approach
- Firebase Cloud Messaging (FCM) Web:
  - Request notification permission in-app; register service worker `firebase-messaging-sw.js` (path configurable via env).
  - Obtain FCM device token; store in Firestore `notificationTokens/{uid}/{token}` or collection `notificationTokens` with `{ uid, token, platform }`.
  - Trigger notifications via Cloud Functions on new message write to a room, targeting member tokens except sender.
  - Foreground: in-app banner/snackbar; Background: OS push.
- Unread counts: client computes per-room unread via `lastReadAt` in `roomMembers` and latest `messages.createdAt`.

## Data Models
- Collection: `notificationTokens`
```ts
interface NotificationToken {
  uid: string
  token: string
  platform: 'web'
  createdAt: Timestamp
}
```
- Field on `roomMembers`: `lastReadAt: Timestamp`.

## API Endpoints
- `POST /api/notifications/register-token` — body: `{ token }` → stores token associated with current `uid`.
- Cloud Function (server): `onMessageCreate(roomId, message)` → fetch room members’ tokens and send FCM notifications.

## UI/UX Specifications
- Permission prompt: explain why notifications help; allow deny/accept; ability to re-enable from settings.
- Foreground: show ephemeral banner with sender name and snippet; clicking navigates to room.
- Badge counts: display on chat list items and optionally app favicon badge (if desired post-MVP).

## Acceptance Criteria (from PRD)
- Users receive push notifications for new messages when app is closed.
- Notifications show sender + snippet.
- Unread badge count updates accurately.

## Security & Permissions
- Only authenticated users can register tokens for themselves.
- Unsubscribe/remove token on logout.

## Edge Cases
- Token rotation; handle `messaging.onTokenRefresh` and purge invalid tokens on send failures.
- Browsers without push support — gracefully degrade to in-app banners only.
