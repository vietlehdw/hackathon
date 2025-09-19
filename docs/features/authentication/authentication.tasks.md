# Authentication — Task Breakdown

## Ordered Tasks
1. Firebase project setup; enable Email/Password and Google providers.
2. Add Firebase client initializers in `lib/` (auth, firestore, storage, messaging, rtdb).
3. Implement AuthProvider (context) and hooks for `useAuth`, `useRequireAuth`.
4. Build login/signup UI with shadcn/ui; wire email/password flows.
5. Add Google SSO button; handle redirect/popup sign-in.
6. Implement password reset flow.
7. Create `users/{uid}` doc on first login; redirect to profile setup if incomplete.
8. Protect routes (layout or middleware); redirect unauthenticated users to login.
9. Add logout action; ensure session clears immediately.
10. QA against acceptance criteria and error cases.

## Dependencies
- Firebase project and web app credentials (.env).
- User Profiles feature for post-login profile setup routing.

## Estimated Effort
- Setup + flows: M
- UI polish + error states: S

## Implementation Notes
- Prefer popup sign-in for Google in browser; fallback to redirect on Safari if blocked.
- Keep auth state minimal in React; use Firebase listeners instead of storing tokens in state.
- Consider adding App Check later; not required for MVP.
