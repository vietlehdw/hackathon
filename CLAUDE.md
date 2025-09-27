# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a real-time chat application built for a hackathon using Next.js 15 with App Router, React 19, Firebase, and shadcn/ui. The app supports authentication, direct/group messaging, real-time presence, and push notifications. See docs/PRD.md for detailed product requirements.

## Development Commands

**Package Manager: Use `pnpm` (not npm)**

```bash
# Development
pnpm dev --turbopack           # Start development server with Turbopack

# Production
pnpm build --turbopack         # Build with Turbopack
pnpm start                     # Start production server

# Type checking
pnpm tsc --noEmit              # TypeScript type checking

# Testing (setup pending as of current package.json)
# pnpm vitest                   # Run all tests (add Vitest to devDependencies when implementing)
# pnpm vitest -t \"test name\"    # Run specific test
```

## Architecture & Stack

**Frontend:**
- Next.js 15 with App Router (React 19): Server components default, `'use client'` for interactivity
- Tailwind CSS 4 with shadcn/ui components and Lucide React icons
- Absolute imports via `@/*` alias (tsconfig.json)

**Backend:**
- Firebase Auth (email/password + Google SSO)
- Firestore for persistent chat data
- Realtime Database for presence & typing indicators
- Cloud Storage for image messages
- Cloud Functions for server-side logic
- FCM for push notifications

**Project Structure:**
- `app/` - Next.js routes, layouts, pages, server actions; use route groups like `(auth)`, `(chat)`
- `lib/` - Utilities, Firebase client/server config
- `components/` - Reusable UI (shadcn/ui in `@/components/ui`)
- `docs/` - PRD and feature specs (kebab-case for features)
- `.cursor/rules/` - Guidelines: project-structure.mdc (architecture), nextjs-patterns.mdc (App Router), ui-styling.mdc (shadcn/Tailwind), firebase-integration.mdc

## Key Configuration

**TypeScript:** Strict mode, prefer `type` over `interface`

**Styling:**
- Tailwind utilities primary, `cn()` from `@/lib/utils` for conditional classes
- Mobile-first responsive design, WCAG accessibility (ARIA, keyboard nav)
- Keep files <250 LOC, colocate feature code

## Firebase Integration Patterns

**Client-side:**
- SDK for real-time (presence, typing), auth state, Firestore subscriptions

**Server-side:**
- Server actions for mutations, Admin SDK for secure ops
- API routes only if server actions insufficient

## Feature Development Guidelines

**Chat Features:**
- Direct (1-to-1) and group messaging
- Text/image messages with real-time updates
- Presence indicators, typing notifications
- Push notifications for new messages

**Authentication:**
- Email/password + Google SSO, protected routes
- User profiles (name, username, photo, bio) editable/viewable

**Admin Features:**
- Manage users/rooms, moderate content

## Important Notes

- Server components default; implement loading/error.tsx for routes
- Firebase security rules essential; cleanup listeners
- No sensitive data logging
- Optimize: Next.js Image, virtualization for messages, Suspense boundaries

See `docs/PRD.md` for requirements and `docs/features/*/` for specs.
