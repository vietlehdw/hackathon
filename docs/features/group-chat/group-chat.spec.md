# Group Chat — Technical Specification

## Feature Requirements
- Create named group rooms with multiple participants.
- Room management: create, join, leave, invite.
- Real-time text and image messages, same model as DMs.

## Technical Approach
- Use same `rooms`, `roomMembers`, and `messages` collections as DMs with `rooms.type = 'group'`.
- Room creation flow sets creator as `owner` role; invites add members as `member`.
- Membership changes update queries in clients via roomMembers subscription.

## Data Models
- `rooms` (see Direct Messaging spec) with additional fields for groups:
```ts
interface GroupRoom extends Room {
  type: 'group'
  name: string
  imageURL?: string // optional group avatar
  memberCount: number
}
```
- `roomMembers` and `messages` same as DMs.

## API Endpoints
- Optional helpers (can be client-only with rules):
  - `POST /api/rooms` — body: `{ name, memberUids[] }` → creates group room and members.
  - `POST /api/rooms/:id/invite` — body: `{ memberUids[] }` → adds members.
  - `POST /api/rooms/:id/leave` — body: `{}` → removes self.

## UI/UX Specifications
- New Group flow: name input, member multi-select, confirm.
- Group room header shows group name/avatar and member count; tap to view members and leave.
- Message UI identical to DMs; presence shows multiple participants, typing shows multiple users.

## Acceptance Criteria (from PRD)
- Users can create and participate in group chats.
- Room management: create, join, leave, invite.
- Messages (text + images) appear in correct order and persist.

## Security & Permissions
- Only members can read/write messages.
- Only owners can invite (MVP) or any member can invite (loosen via rule if desired).
- Leaving a room removes member doc; if last owner leaves, transfer or mark room archived (MVP: prevent last owner from leaving until ownership transfer).

## Edge Cases
- Inviting an already-member user — no-op.
- Removing a user who is typing — ensure UI clears typing state on membership change.
