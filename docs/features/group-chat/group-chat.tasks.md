# Group Chat — Task Breakdown

## Ordered Tasks
1. Extend room creation to support `type='group'`, `name`, `memberCount`.
2. Build New Group UI (name + member picker) and creation flow.
3. Implement invite flow to add members to existing group.
4. Implement leave flow; update member count and permissions.
5. Reuse chat room UI from DMs; ensure group header and member list are shown.
6. Add typing/presence indicators for multiple participants.
7. QA membership changes and messaging behaviors.

## Dependencies
- Authentication, User Profiles, Direct Messaging (shared components/data model).
- Real-time Presence.

## Estimated Effort
- Data + UI + flows: M-L

## Implementation Notes
- Keep member list denormalized count on `rooms.memberCount` for chat list performance.
- Consider pagination for member list if large (post-MVP).
