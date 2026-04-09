# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
Also contains the **Happy Tail** app (a standalone full-stack Express + React app in `happy-tail/`).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm (monorepo), npm (happy-tail)
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Happy Tail App

Located in `happy-tail/`. This is a standalone Express + Vite full-stack app (not part of the pnpm workspace). It is served via the `artifacts/happy-tail-app: web` workflow.

- **Run**: Served via workflow `artifacts/happy-tail-app: web` → `cd /home/runner/workspace/happy-tail && PORT=24183 npm run dev`
- **Port**: 24183 (assigned by artifact system)
- **DB schema**: Push with `cd happy-tail && npx drizzle-kit push`
- **AI Integration**: Uses `AI_INTEGRATIONS_OPENAI_API_KEY` + `AI_INTEGRATIONS_OPENAI_BASE_URL` (Replit AI Integrations for OpenAI)
- **Auth**: Replit Auth (OIDC via `REPL_ID` and `REPLIT_DOMAINS`)
- **Features**: Emotion Detection, Bark Translator, AI Health Scanner, Diet Planner, Vet Chat, Breed Guide, Dog-friendly Locations, Community (all AI features use OpenAI vision)
- **Dependencies**: Install with `cd happy-tail && npm install`

## Key Commands (monorepo)

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run workspace API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
