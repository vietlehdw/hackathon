# Real-time Presence — Technical Specification

## Feature Requirements
- Show who is online/away.
- Typing indicators within a conversation (show within 1s; clear within 3s of idle or on send).

## Technical Approach
- Presence: Firebase Realtime Database (RTDB) `status/{uid}` with `onDisconnect` to set offline and update `lastChanged`.
- Typing: RTDB `typing/{roomId}/{uid}: true|false`; clients set true on keystroke, debounce to false on idle or on send.
- Subscribe to presence/typing for room participants.

## Data Models (RTDB)
- `/status/{uid}` → `{ state: 'online' | 'offline', lastChanged: number }`
- `/typing/{roomId}/{uid}` → boolean

## API Endpoints
- None required; client directly writes/reads RTDB with rules.

## UI/UX Specifications
- Presence: green dot (online) or hollow/grey (away) next to avatars; show tooltip with "Online" or "Last seen X mins ago" (optional for MVP if tracking last seen).
- Typing: inline "X is typing…"; for groups, display up to N names then "others".
- Timings: show within ~1s of typing; clear within 3s of idle or on send.

## Acceptance Criteria (from PRD)
- User's status changes to "online" when active, "away" after inactivity.
- Typing indicators show within 1 second of keystrokes.
- Indicators disappear within 3 seconds of idle or on send.

## Security & Permissions
- RTDB rules: allow read of presence/typing for authenticated users only; typing path restricted to room members.

## Edge Cases
- App crashes or network drops — `onDisconnect` ensures offline is set by server.
- Multiple tabs/devices — consider union logic: online if any connection path is online.
