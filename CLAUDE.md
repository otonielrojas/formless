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
- Claude API (`claude-sonnet-4-6`) for AI classification + extraction
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

## Current Phase
Phase 0 → Phase 1 (Core MVP). See `docs/ROADMAP.md` for checklist.

## Project Root
`C:\Users\otoni\repos\formless\`
