# Admin Functionality — Task Breakdown

## Ordered Tasks
1. Add admin role support (`users.role` and/or custom claims seeded manually for MVP).
2. Build Admin Dashboard route with tabs for Users and Rooms.
3. Implement listing queries with pagination and simple filters.
4. Implement `remove-message` action (API route + client UI with confirm).
5. Implement `remove-user` action (API route + client UI with confirm).
6. Gate access server-side (verify ID token + role) and client-side (hide links if not admin).
7. QA flows; ensure non-admin access is denied.

## Dependencies
- Authentication, User Profiles, Messaging data.

## Estimated Effort
- Dashboard + endpoints: M

## Implementation Notes
- Start with API routes using Firebase Admin SDK initialized server-side from env.
- Consider moderation log collection to track actions.
