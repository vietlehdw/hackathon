

# HACKATHON IDEA PRD
## Chatbot App – Product Requirements Document (PRD)

### 1. Product Overview
A simple but modern chat platform where authenticated users can create profiles, connect in direct or group conversations, and exchange text and images in real time. The app should feel responsive and familiar, with presence indicators, typing notifications, and push notifications to keep conversations flowing.

### 2. Goals & Deliverables
The MVP must support:

#### Authentication
- Email + password login (with reset flow).
- Single Sign-On (SSO) via Google or similar.
- Secure session handling (stay logged in, logout).

#### User Profile
- Editable profile with name, username, photo, and short bio.
- Ability to view others' profiles from a chat.

#### Chat
- 1–1 conversations between two users.
- Group chat rooms with multiple participants.
- Room management: create, join, leave, invite.
- Send and receive text messages.
- Send and receive image messages with previews.

#### Real-time Presence
- Show who is online/away.
- Typing indicators within a conversation.

#### Notifications
- Push notifications for new messages (foreground and background).
- Badge counts for unread messages.

#### Basic Admin Needs
- Ability for an admin to view active users and rooms.
- Remove inappropriate content/users if needed.

### 3. Bonus Goals (stretch features if time allows)
- Message reactions (😂, 👍, etc.).
- Message editing and deletion.
- Threaded replies inside rooms.
- End-to-end encryption.
- Advanced moderation tools (banning, muting).
- Public/discoverable channels.

### 4. User Journeys

#### 4.1 New User (First Login)
- User signs up with email/password or logs in with SSO.
- They are prompted to set up profile (name, photo, username).
- They see a default home screen with no active chats and a "Start Conversation" button.

#### 4.2 Direct Message (1–1 Chat)
- User searches for another user by name or username.
- User starts a conversation → new chat room opens.
- Messages are exchanged in real time, with typing indicators and online status visible.
- If the app is closed, the recipient gets a push notification for new messages.

#### 4.3 Group Chat
- User taps "New Group" and selects members.
- User names the group and confirms creation.
- All members can send text or images.
- Presence and typing indicators show multiple participants.
- Push notifications arrive for group activity.

#### 4.4 Profile Interaction
- From a chat, user taps another participant's avatar.
- Profile opens with name, username, photo, and bio.
- Option to start DM or view mutual groups.

#### 4.5 Notifications
When a message arrives in a chat the user belongs to:
- Foreground: in-app banner.
- Background: OS-level push with sender name and snippet.
- Badge count increments until user reads.

### 5. Acceptance Criteria

#### Authentication
- Users can sign up/login with email + password.
- Users can login with Google/SSO.
- Logged-in state persists across sessions.
- Logout removes access immediately.

#### User Profile
- Users can upload/change profile photo.
- Users can edit name, username, and bio.
- Clicking an avatar opens a profile view.

#### Chat
- Users can create and participate in 1–1 chats.
- Users can create and participate in group chats.
- Messages (text + images) appear in the correct order.
- Images display with thumbnail/preview.
- Rooms persist history across sessions.

#### Presence & Typing
- User's status changes to "online" when active, "away" after inactivity.
- Typing indicators show within 1 second of keystrokes.
- Indicators disappear within 3 seconds of idle or on send.

#### Notifications
- Users receive push notifications for new messages when app is closed.
- Notifications show sender + snippet.
- Unread badge count updates accurately.

#### Admin
- Admin can see list of active users and rooms.
- Admin can remove a user or a message.

### 6. Success Metrics
- Functional: 95% of test cases pass for authentication, messaging, and notifications.
- Performance: Messages appear in <2s, presence updates in <5s.
- Reliability: App handles 50+ concurrent users without crash.
- Adoption: >70% of participants complete profile setup during first login.

### 7. Future Considerations
- Reactions, threads, and moderation tools as next steps.
- Scalability: larger group rooms and public channels.
- Security: encrypted storage and eventually end-to-end encryption.