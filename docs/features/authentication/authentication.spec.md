# Authentication — Technical Specification

## Feature Requirements
- Email + password sign up/login with reset flow.
- Google SSO (via Firebase Auth Google provider).
- Persisted session; sign-out clears access immediately.
- Guard protected routes; redirect unauthenticated users to login.

## Technical Approach
- Firebase Auth (modular v9+ SDK) in client for sign-in flows.
- Next.js 15 App Router with server components; client providers for auth state.
- Store minimal user profile in Firestore on first login and keep in sync (see User Profiles spec).
- Use `onAuthStateChanged` to reflect session in UI; SSR server actions check ID token as needed.

## Data Models
- Firebase Auth User: managed by Firebase (uid, email, emailVerified, providerData, etc.)
- Firestore `users/{uid}` document (see User Profiles spec) created on first login.

## API Endpoints
- Primary: none required; use Firebase Auth SDK directly.
- Optional server-side verification:
  - `POST /api/auth/verify-id-token` (server action) — verify Firebase ID token to gate admin-only operations.

## UI/UX Specifications
- Screens:
  - Login/Signup page: email/password form; "Continue with Google" button; link to reset password.
  - Password reset: enter email → Firebase sends reset email.
  - Post-auth redirect to home (chat list) if profile is complete; else to profile setup.
- Error handling: inline field errors; toast on auth errors; disable submit while pending.
- Loading states: skeleton or spinner during provider redirects.

## Acceptance Criteria (from PRD)
- Users can sign up/login with email + password.
- Users can login with Google/SSO.
- Logged-in state persists across sessions.
- Logout removes access immediately.

## Security & Permissions
- Use Firebase Auth; enforce Firestore/Storage rules using `request.auth != null`.
- Rate-limit sensitive API routes (if added) with simple in-memory throttling or Firebase App Check (future).

## Edge Cases
- Email already in use / invalid password.
- Multiple provider link: allow account linking within profile settings (post-MVP optional).
