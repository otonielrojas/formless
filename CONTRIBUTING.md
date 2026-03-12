# Contributing to Formless

Thank you for your interest in Formless!

## Current Status: Early Development

Formless is in active early development. The codebase is evolving quickly and the schema/API may change significantly. For this reason, **external pull requests are not being accepted at this time** while the MVP is being validated.

**What you can do right now:**

- ⭐ Star the repo to follow progress
- 🐛 [Report bugs](https://github.com/otonielrojas/formless/issues/new?template=bug_report.yml)
- 💡 [Suggest features](https://github.com/otonielrojas/formless/issues/new?template=feature_request.yml)
- 💬 Share feedback by opening a discussion

Once the MVP is stable, trusted contributors will be invited to collaborate. This file will be updated when that happens.

---

## For Invited Contributors

If you've been invited to contribute, here is the full workflow.

### Prerequisites

- Node.js v18+
- A Supabase account (free tier)
- A Groq API key (free tier at console.groq.com)

### Setup

```bash
git clone https://github.com/otonielrojas/formless.git
cd formless/app
npm install
cp .env.local.example .env.local
# Fill in your Supabase and Groq credentials in .env.local
```

Run the database migration in your Supabase SQL editor:
```bash
# Paste the contents of supabase/migrations/001_initial_schema.sql
# into your Supabase project's SQL editor and run it
```

Start the dev server:
```bash
npm run dev
# App runs at http://localhost:3000
```

### Branch Workflow

Always work in a branch — **never commit directly to `master`**.

```bash
git checkout master && git pull
git checkout -b <type>/<short-description>
```

| Prefix | When to use |
|--------|-------------|
| `feat/` | New user-visible functionality |
| `fix/` | Bug fix |
| `chore/` | Deps, config, tooling |
| `test/` | Tests only |
| `docs/` | Documentation only |
| `refactor/` | Code restructure, no behaviour change |

### Before Opening a PR

```bash
cd app
npm run lint      # zero lint errors
npm run build     # must succeed (catches TypeScript errors)
```

### PR Requirements

- All CI checks must pass
- New behaviour must have tests; bug fixes must include a regression test
- `docs/ROADMAP.md` updated if a milestone item is completed
- `CLAUDE.md` updated if architectural decisions change

### Commit Format

We follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <short summary>

[optional body explaining why, not what]
```

Types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `ci`

### Code Style

- TypeScript strict mode — no `any` unless unavoidable
- Tailwind for all styling — no inline styles
- All AI output must be Zod-validated before touching the database
- Use the service role Supabase client for server-side operations that bypass RLS
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `GROQ_API_KEY` to the client

### Key Architecture Decisions

Before contributing, read:
- `CLAUDE.md` — dev conventions and AI pipeline overview
- `docs/ARCHITECTURE.md` — tech stack and design decisions
- `docs/PRD.md` — product requirements and user flows

### Questions?

Open a [GitHub Discussion](https://github.com/otonielrojas/formless/discussions) or reach out via the issue tracker.
