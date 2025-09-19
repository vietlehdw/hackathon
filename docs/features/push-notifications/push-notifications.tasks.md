# Push Notifications — Task Breakdown

## Ordered Tasks
1. Configure Firebase Messaging and generate Web Push (VAPID) key; add to `.env.local`.
2. Add service worker file `public/firebase-messaging-sw.js` and Messaging initialization.
3. Implement permission request + token retrieval; store token via `/api/notifications/register-token`.
4. Track `lastReadAt` for members; compute unread counts in UI.
5. Implement Cloud Function to send notifications on new message (skip sender).
6. Foreground handler: show in-app banner with click-to-open.
7. Logout flow: revoke and delete token.
8. QA across browsers; verify background receipt and badge behavior.

## Dependencies
- Authentication for `uid`.
- Direct Messaging/Group Chat for message triggers.

## Estimated Effort
- Messaging + SW + function: M-L

## Implementation Notes
- Use topic or per-token send; start with per-token and batch.
- Handle token invalidation by removing tokens on send error codes.
