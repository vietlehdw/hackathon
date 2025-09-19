# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a real-time chat application built for a hackathon using Next.js 15 with App Router, React 19, Firebase, and shadcn/ui. The app supports authentication, direct/group messaging, real-time presence, and push notifications.

## Development Commands

**Package Manager: Use `pnpm` (not npm)**

```bash
# Development
pnpm dev --turbopack           # Start development server with Turbopack

# Production
pnpm build --turbopack         # Build with Turbopack
pnpm start                     # Start production server

# Type checking
pnpm tsc --noEmit             # TypeScript type checking

# Testing (when added)
pnpm vitest                   # Run all tests
pnpm vitest -t "test name"    # Run specific test
```

## Architecture & Stack

**Frontend:**
- Next.js 15 with App Router (React 19)
- Server components by default - add `'use client'` for interactivity
- Tailwind CSS 4 with shadcn/ui components
- Lucide React icons

**Backend:**
- Firebase Auth (email/password + SSO)
- Firestore (persistent chat data)
- Realtime Database (presence & typing indicators)
- Cloud Storage (image messages)
- Cloud Functions (server-side logic)
- FCM (push notifications)

**Project Structure:**
- `app/` - Next.js routes, layouts, pages, server actions
- `lib/` - Utilities, Firebase client/server config
- `docs/` - PRD and feature specifications
- `.cursor/rules/` - Development guidelines

## Key Configuration

**Imports:** Use absolute paths with `@/*` alias (configured in tsconfig.json)

**TypeScript:** Strict mode enabled, prefer `type` over `interface`

**Styling:**
- Tailwind utilities first
- Use `cn()` helper from `@/lib/utils` for conditional classes
- shadcn/ui components in `@/components/ui`

**File Organization:**
- Keep files under 250 LOC
- Colocate feature-specific code
- Use kebab-case for files in docs/

## Firebase Integration Patterns

**Client-side:**
- Firebase SDK for real-time features (presence, typing)
- Authentication state management
- Firestore subscriptions for chat messages

**Server-side:**
- Next.js server actions for mutations
- Firebase Admin SDK for secure operations
- API routes only when server actions aren't suitable

## Feature Development Guidelines

**Chat Features:**
- Direct messaging (1-to-1)
- Group chat rooms
- Text and image messages
- Real-time presence indicators
- Typing notifications
- Push notifications

**Authentication:**
- Email/password + Google SSO
- Protected routes and session handling
- User profiles with photos and bios

**Admin Features:**
- User and room management
- Content moderation capabilities

## Important Notes

- Server components by default - use `'use client'` sparingly
- Implement proper error boundaries and loading states
- Follow Firebase security rules for data protection
- Use `loading.tsx` and `error.tsx` for route-level UI states
- Handle real-time listeners cleanup properly
- Never log sensitive data (tokens, passwords)

See `docs/PRD.md` for detailed product requirements and `docs/features/*/` for specific feature specifications.