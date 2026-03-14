# Formless — Claude Instructions

## What This Project Is
Formless replaces enterprise forms with natural language intake. Users describe what they need
in plain English; Formless classifies the request, extracts structured data, validates it against
a schema, and routes it to the right destination.

**Path C** from the original AI CMS brainstorm (see `docs/brainstorm.md`).
Origin prototype: `C:\Users\otoni\repos\nlp-cms`

## Always Read First
- `docs/PRD.md` — product requirements and user flows
- `docs/ARCHITECTURE.md` — tech stack decisions and AI pipeline design
- `docs/ROADMAP.md` — current phase and what's next

## Tech Stack
- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- Groq API (`llama-3.3-70b-versatile`) for AI classification + extraction — free tier for MVP
  - Swap to `claude-sonnet-4-6` later by replacing client in `lib/ai/extract.ts`
  - Env var: `GROQ_API_KEY` (get free key at console.groq.com)
- Zod for schema validation (critical — all AI output must be validated)
- Supabase (PostgreSQL + Auth)
- Vercel deployment

## Core AI Pipeline
Two-pass architecture (see `docs/ARCHITECTURE.md`):
1. **Classify** — does this input match the schema?
2. **Extract** — pull structured fields from natural language
3. **Validate** — Zod parse against schema definition
4. **Clarify** — if required fields missing, generate one follow-up question

Never skip Zod validation. Raw AI output never goes directly to the database.

## Key Conventions
- Store money (if ever needed) as integers in cents
- All DB queries must include `workspace_id` for tenant isolation
- Intake URLs use random tokens, never sequential IDs
- Schema definitions stored as JSONB (`docs/ARCHITECTURE.md` has the format)
- AI API key is server-side only — never expose to client

## Git & Branching Policy

**Never commit directly to `master`.** Master is production — it deploys to Netlify on push.

### Branch naming
| Type | Pattern | Example |
|------|---------|---------|
| Feature / roadmap item | `feature/<name>` | `feature/phase-2-webhooks` |
| Security / hardening | `security/<name>` | `security/session-hardening` |
| Bug fix | `fix/<name>` | `fix/intake-validation` |

### Workflow for every task
1. Start from an up-to-date `master`: `git checkout master && git pull`
2. Create a branch: `git checkout -b feature/<name>`
3. Implement, test, commit incrementally on the branch
4. When done: `npm test` green + `npx tsc --noEmit` clean
5. Merge to master: `git checkout master && git merge --no-ff feature/<name>`
6. Push master: `git push origin master`
7. Delete the branch: `git branch -d feature/<name>`

### Commit messages
- Use imperative present tense: "Add webhook dispatch" not "Added"
- One logical change per commit — don't mix features
- Reference roadmap section when relevant: "Add rate limiting (security item 3.1)"

## Testing Workflow

Every feature we ship must pass this checklist before moving to the next roadmap item.

### 1. Unit tests (`npm test` in `app/`)
- Write tests for any pure server-side logic (retry loops, data transforms, validation).
- Colocate test files: `lib/foo/bar.test.ts` next to `lib/foo/bar.ts`.
- Mock all external I/O (Supabase, fetch, Groq) — never hit real services in tests.
- All tests must be green before proceeding.

### 2. Build check
- Run `npm run build` in `app/` — this catches both TypeScript errors and ESLint errors that Next.js enforces at build time.
- `npx tsc --noEmit` alone is not sufficient; the build must pass cleanly.

### 3. Manual smoke test
After running the dev server (`npm run dev`), verify the feature end-to-end:
- **Schema list**: copy URL button copies correct full URL; webhook URL saves and persists on refresh.
- **Intake**: submit triggers webhook POST; delivery appears in `/webhooks` log with correct status.
- **Webhook failure**: point webhook URL at a dead URL, verify retry attempts = 3 and status = failed in log.
- **Auth boundary**: confirm unauthenticated users cannot reach dashboard pages.

### 4. What NOT to test
- Next.js routing, Supabase RLS policies, React rendering — these are framework guarantees.
- One-liner UI components with no logic.

## Current Phase
Phase 2: Integrations & Channels. See `docs/ROADMAP.md` for checklist.

## Project Root
`C:\Users\otoni\repos\formless\`
