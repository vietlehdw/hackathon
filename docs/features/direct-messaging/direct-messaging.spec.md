# Direct Messaging — Technical Specification

## Feature Requirements
- 1–1 conversations between two users.
- Real-time sending/receiving of text and image messages.
- Conversation history persists across sessions.

## Technical Approach
- Firestore collections for rooms and messages; `rooms.type = 'dm'`.
- A DM room is uniquely determined by the two member UIDs — enforce single room per pair.
- Client subscribes to messages via Firestore queries with real-time listeners and pagination.
- Image uploads to Storage; message stores `imageURL` and optional `imageThumbURL`.

## Data Models
- Collection: `rooms`
```ts
interface Room {
  id: string
  type: 'dm' | 'group'
  name?: string
  createdBy: string // uid
  createdAt: Timestamp
  lastMessageAt: Timestamp
}
```
- Collection: `roomMembers`
```ts
interface RoomMember {
  roomId: string
  uid: string
  role: 'owner' | 'member'
  joinedAt: Timestamp
}
```
- Collection: `messages`
```ts
interface Message {
  id: string
  roomId: string
  senderId: string
  type: 'text' | 'image'
  text?: string
  imageURL?: string
  imageThumbURL?: string
  createdAt: Timestamp
}
```
Indexes:
- `messages` composite index on `(roomId asc, createdAt desc)` for pagination.

## API Endpoints
- Optional helpers (can be client-only with rules):
  - `POST /api/rooms/dm` — body: `{ peerUid }` → returns existing room or creates new DM room with two members.
  - `POST /api/messages/upload-url` — optional signed upload flow if needed; otherwise upload via Firebase SDK.

## UI/UX Specifications
- Start conversation: search user by name/username → tap to create/open DM.
- Chat UI: message list (reverse chronological with auto-scroll), composer with text input and image attach, send button.
- Show peer avatar/name, presence status, typing indicator.
- Image messages show thumbnail/preview; tap to open full-screen.

## Acceptance Criteria (from PRD)
- Users can create and participate in 1–1 chats.
- Messages (text + images) appear in the correct order.
- Images display with thumbnail/preview.
- Rooms persist history across sessions.

## Security & Permissions
- Firestore rules: only room members can read/write messages in that room.
- Storage rules: image path includes roomId; restrict to room members.

## Edge Cases
- Duplicate DM room creation under race — enforce with deterministic room key or transaction.
- Large images — enforce client-side size limit, compress before upload.
