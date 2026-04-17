# SmartQueue AI

SmartQueue AI is a monorepo for an intelligent virtual queue management system. It includes the customer-facing web app, the API server, shared schema and client libraries, and supporting tooling for database and API code generation.

## What It Includes

- A React + Vite frontend for customers, staff, and administrators
- An Express 5 API server with queue, token, auth, analytics, and display routes
- Shared API schema and client packages generated from the OpenAPI spec
- Drizzle-based database access and schema management
- A mockup sandbox for rapid UI prototyping and previewing

## Tech Stack

- Node.js 24
- pnpm workspaces
- TypeScript 5.9
- Express 5
- React + Vite
- PostgreSQL + Drizzle ORM
- Zod and drizzle-zod for validation
- Orval for API generation
- esbuild for server bundling

## Repository Layout

```text
artifacts/
  api-server/       Express API and server build pipeline
  smartqueue/       Main web application
  mockup-sandbox/   UI playground and preview environment
lib/
  api-client-react/ React Query client generated from the API spec
  api-spec/         OpenAPI source and Orval config
  api-zod/          Shared Zod schemas generated from the API spec
  db/               Drizzle schema and database helpers
scripts/            Utility scripts and workspace helpers
```

## Prerequisites

- Node.js 24 or newer
- pnpm
- PostgreSQL database for local development and the API server

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set up the required environment variables:

- `DATABASE_URL` - required by the database package and API server
- `PORT` - required by the API server
- `SESSION_SECRET` - optional cookie/session secret for auth
- `RESEND_API_KEY` - optional email delivery key used by the API server
- `LOG_LEVEL` - optional API logging level
- `BASE_PATH` - optional asset base path for Replit-style deployments

3. Run the full workspace typecheck:

```bash
pnpm run typecheck
```

4. Build everything:

```bash
pnpm run build
```

## Common Commands

- `pnpm run typecheck` - typecheck the full workspace
- `pnpm run build` - typecheck and build all packages
- `pnpm --filter @workspace/api-server run dev` - run the API server locally
- `pnpm --filter @workspace/smartqueue run dev` - run the main web app locally
- `pnpm --filter @workspace/mockup-sandbox run dev` - run the mockup sandbox locally
- `pnpm --filter @workspace/api-spec run codegen` - regenerate API client and schema outputs
- `pnpm --filter @workspace/db run push` - push database schema changes during development

## Notes

- The API server will not start without a valid `PORT` and `DATABASE_URL`.
- The frontend uses workspace-generated API clients and shared schemas, so keep the generated packages in sync when the OpenAPI spec changes.
- The repository is structured as a workspace, so package-level scripts should be run with `pnpm --filter ...` when targeting a single app or library.
