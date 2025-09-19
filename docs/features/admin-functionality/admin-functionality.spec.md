# Admin Functionality — Technical Specification

## Feature Requirements
- Admin can view active users and rooms.
- Admin can remove a user or a message.

## Technical Approach
- Admin role indicated on `users/{uid}.role = 'admin' | 'user'` or via custom claims.
- Read-only dashboards (users, rooms) powered by Firestore queries.
- Destructive actions executed via privileged backend:
  - Next.js API routes that verify Firebase ID token and admin role, or
  - Firebase Cloud Functions callable endpoints.

## Data Models
- `users` (see User Profiles spec) with optional `role` field.
- `rooms`, `roomMembers`, `messages` as defined in messaging specs.

## API Endpoints
- `POST /api/admin/remove-user` — body: `{ uid }` → disables user (via Admin SDK) and marks profile as deactivated; optionally removes from rooms.
- `POST /api/admin/remove-message` — body: `{ roomId, messageId }` → deletes message and updates room last message if needed.
- `GET /api/admin/active` — returns paginated lists of active users (presence-based) and active rooms (recent `lastMessageAt`).

## UI/UX Specifications
- Admin dashboard (accessible only to admins):
  - Users tab: list with search, status (online/offline), actions: remove/disable.
  - Rooms tab: list with memberCount and lastMessageAt, action: remove message by id (modal).
- Confirm dialogs for destructive actions; show toasts for success/failure.

## Acceptance Criteria (from PRD)
- Admin can see list of active users and rooms.
- Admin can remove a user or a message.

## Security & Permissions
- Server verifies admin role for admin endpoints.
- Audit trail (optional): write a moderation log document for each action.

## Edge Cases
- Removing a user that owns group: transfer ownership or archive groups (MVP: prevent removal if sole owner; show error).
- Deleting a message that is last in room — update `rooms.lastMessageAt` and preview fields accordingly.
