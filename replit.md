# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Email Notifications

Email is powered by **Resend** (`resend` npm package in `artifacts/api-server`).
- API key stored as secret: `RESEND_API_KEY`
- Email service: `artifacts/api-server/src/lib/email.ts`
- GitHub integration was dismissed — use PAT + git CLI if needed in the future
- Three triggered emails:
  1. **Token Joined** — sent when a user joins a queue (confirmation + wait time)
  2. **Token Called** — sent when admin calls next token ("It's your turn!")
  3. **Token Skipped** — sent when a token is skipped by staff
- All emails fire-and-forget (won't block the API response if Resend is down)
- FROM address uses `onboarding@resend.dev` (Resend sandbox); switch to a verified domain for production
