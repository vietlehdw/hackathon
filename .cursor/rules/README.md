# Cursor Rules for Hackathon Chat App

This directory contains Cursor Rules that help guide development of the real-time chat application. These rules are automatically applied by Cursor to provide context-aware assistance.

## Available Rules

### Always Applied Rules
- **project-structure.mdc** - Project architecture and organization guidelines

### File-Type Specific Rules
- **typescript-quality.mdc** - TypeScript and code quality standards (applies to .ts/.tsx files)
- **nextjs-patterns.mdc** - Next.js 15 App Router patterns (applies to app/ directory)

### Context-Specific Rules
- **firebase-integration.mdc** - Firebase services integration patterns
- **ui-styling.mdc** - UI/UX guidelines with shadcn/ui and Tailwind CSS
- **feature-development.mdc** - MVP feature requirements and development approach
- **security-performance.mdc** - Security and performance best practices

## How Rules Work

1. **Always Applied**: `project-structure.mdc` provides constant context about the project
2. **File-Type Specific**: Rules with `globs` apply when working with matching file types
3. **Manual Context**: Rules with `description` can be fetched when relevant topics are discussed

## Key Project Information

- **Tech Stack**: Next.js 15, React 19, Firebase, Tailwind CSS 4, shadcn/ui
- **Package Manager**: pnpm (not npm)
- **Architecture**: Real-time chat with authentication, messaging, presence, and notifications
- **Documentation**: See [docs/PRD.md](../docs/PRD.md) and [docs/general.md](../docs/general.md)

## Development Commands

```bash
pnpm dev --turbopack    # Start development server
pnpm build --turbopack  # Build for production
pnpm start              # Start production server
```

These rules ensure consistent development practices and help maintain the project's architecture and quality standards throughout the hackathon development process.
