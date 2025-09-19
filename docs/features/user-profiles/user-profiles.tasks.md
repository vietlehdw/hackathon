# User Profiles — Task Breakdown

## Ordered Tasks
1. Define `users` schema and security rules (doc-only for now); implement client validator.
2. Build Profile Setup page (post-auth redirect if profile incomplete).
3. Implement username availability check (Firestore query or reservation doc).
4. Implement photo upload to Storage; store `photoURL` in profile.
5. Build Profile View page/modal; link from avatars in chat UIs.
6. Add edit flow from account/settings.
7. QA uniqueness and validation rules; handle collisions gracefully.

## Dependencies
- Authentication feature for user `uid`.

## Estimated Effort
- Forms + Storage upload: M
- Availability check + polish: S

## Implementation Notes
- Normalize `username` to lowercase kebab/slug on input.
- Consider optimistic claim UI, backed by server action for atomicity if needed.
