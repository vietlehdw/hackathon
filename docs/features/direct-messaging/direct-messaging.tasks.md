# Direct Messaging — Task Breakdown

## Ordered Tasks
1. Define Firestore schema: `rooms`, `roomMembers`, `messages`; add composite index for messages.
2. Implement Create/Open DM flow that reuses existing room for a user pair.
3. Build chat list view showing latest message and unread counts (badge optional for MVP).
4. Build room view with message list + composer; wire text send.
5. Implement image upload via Storage; send image messages with preview.
6. Add real-time listeners and pagination (infinite scroll/upwards load).
7. Integrate presence and typing indicators (from Presence feature).
8. QA ordering, error states, and empty states.

## Dependencies
- Authentication, User Profiles.
- Real-time Presence for status/typing display hooks.

## Estimated Effort
- Data + UI + listeners: L

## Implementation Notes
- Use `serverTimestamp()` for `createdAt` and `lastMessageAt`.
- Denormalize last message preview onto `rooms` for faster chat list queries.
