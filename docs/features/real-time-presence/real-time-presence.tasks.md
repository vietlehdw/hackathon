# Real-time Presence — Task Breakdown

## Ordered Tasks
1. Initialize RTDB in client; add connectivity listeners.
2. Implement presence write logic with `onDisconnect` to set offline; update on focus/blur and heartbeat.
3. Implement typing state in composer: set true on keydown, debounce clear after 2s idle or on send.
4. Subscribe to presence and typing for room members; expose hooks to UI.
5. Render presence badges and typing banners in chat list/room.
6. QA timing requirements (≤1s show; ≤3s clear).

## Dependencies
- Authentication to obtain `uid`.
- Direct Messaging/Group Chat to know room members.

## Estimated Effort
- Presence + typing wiring: M

## Implementation Notes
- Consider per-room typing TTL to auto-clear stale flags (server timestamp + client cleanup).
