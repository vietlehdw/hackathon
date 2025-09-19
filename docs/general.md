# General Overview

## Project Overview
A modern, real-time chatbot app. Authenticated users can create profiles, start 1–1 or group conversations, and exchange text and images. The experience includes online presence, typing indicators, and push notifications. The MVP targets speed, reliability, and clarity over extra features.

## Architecture
- UI: Next.js 15 App Router (React 19), shadcn/ui components, Tailwind CSS 4.
- Data: Firebase
  - Authentication (email/password and Google SSO)
  - Firestore for persistent data (users, rooms, membership, messages)
  - Realtime Database for presence and typing signals (fast connect/disconnect with onDisconnect)
  - Cloud Storage for image uploads
  - Cloud Functions (optional) for admin and privileged operations
  - Firebase Cloud Messaging (FCM) for push notifications
- Hosting/Runtime: Next.js dev server locally. Production hosting not fixed yet (Vercel/Cloud Run/etc.).

Data model (high level):
- users: profile and auth-linked metadata
- rooms: direct (dm) and group
- roomMembers: membership, roles
- messages: text and image messages
- presence (RTDB): online/away indicators
- typing (RTDB): who is typing in which room
- notificationTokens: FCM device tokens per user

## Technology Stack
- Next.js 15 with App Router
- React 19
- Tailwind CSS 4
- shadcn/ui (see components.json for configured components)
- Firebase (Auth, Firestore, Realtime Database, Storage, Cloud Functions [optional], Cloud Messaging)

## Development Setup
Prerequisites:
- Node.js 20+
- pnpm or npm (repo uses pnpm lockfile)

Steps:
1. Copy environment template and fill values:
   - `cp .env.example .env.local`
   - Populate Firebase client config and VAPID key for FCM.
2. Install dependencies:
   - `pnpm install`
3. Start the app:
   - `pnpm dev` (Next.js dev server on http://localhost:3000)
4. Build/start:
   - `pnpm build`
   - `pnpm start`

Notes:
- Next.js telemetry can be disabled with `NEXT_TELEMETRY_DISABLED=1` in `.env.local`.
- For push notifications, you need a Firebase-generated Web Push certificate (VAPID key) configured in the Firebase console and set as `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.

## Project Structure
- app/: Next.js routes, layouts, pages, server actions
- lib/: shared utilities (Firebase client/server initializers, helpers)
- public/: static assets
- docs/: product and technical documentation
- .vscode/: recommended editor configuration

Naming & Conventions:
- Kebab-case for files/folders in docs (`docs/features/*`)
- TypeScript throughout
- Keep components small and colocate feature-specific UI under app/ routes or feature folders

## MVP Scope Alignment
This documentation and feature breakdown follows the PRD acceptance criteria for:
- Authentication (email/password + Google SSO)
- User profiles (editable; viewable from chats)
- Chat (DMs and groups; text + image messages; durable history)
- Real-time presence and typing indicators
- Push notifications (foreground banner and background push)
- Basic admin views and moderation actions

## References
- PRD: docs/PRD.md
- Components configuration: components.json
