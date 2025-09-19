# User Profiles — Technical Specification

## Feature Requirements
- Editable profile with name, username, photo, and short bio.
- View other users’ profiles from chat context.
- Unique username constraint.

## Technical Approach
- Firestore `users/{uid}` stores profile data; created/updated by client after auth.
- Username uniqueness enforced via a reserved collection or Cloud Function transaction.
- Images uploaded to Firebase Storage with resized thumbnail (optional; can defer resizing to client-side only for MVP).

## Data Models
- Collection: `users`
```ts
interface UserProfile {
  uid: string
  email: string | null
  displayName: string
  username: string // unique, lowercase
  photoURL: string | null
  bio: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```
- Indexes: username (unique) — implemented via a `usernames/{username}` reservation doc: `{ uid }`.

## API Endpoints
- Optional (for atomic username claim):
  - `POST /api/profile/claim-username` — body: `{ username }`; server verifies availability and writes `usernames/{username}` and updates `users/{uid}`.
- Otherwise can be done entirely client-side with Firestore transaction (with security rules guarding writes).

## UI/UX Specifications
- Profile setup page post-auth: fields for name, username (availability check), bio, photo uploader.
- Profile view (others): avatar, displayName, username, bio, actions: Start DM, View mutual groups.
- Validation: username `[a-z0-9_\-]{3,20}`; show availability indicator.

## Acceptance Criteria (from PRD)
- Users can upload/change profile photo.
- Users can edit name, username, and bio.
- Clicking an avatar opens a profile view.

## Security & Permissions
- Users can only edit their own profile.
- Storage rules restrict write to `users/{uid}` owned paths; validate file size/type on client (image/*, < 5MB).

## Edge Cases
- Username collision on concurrent claims.
- Missing photoURL should render fallback avatar.
