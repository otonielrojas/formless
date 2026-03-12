# Formless — Product Requirements Document

> Version 1.0 — 2026-03-12
> Status: Planning

---

## Problem Statement

Enterprise teams maintain dozens of internal forms — ticketing systems, intake workflows,
incident reports, procurement requests, onboarding checklists. These forms are:

- **Expensive to build and maintain** — every field change requires a developer
- **Painful to fill out** — users abandon forms or fill them in incorrectly
- **Opaque** — structured data is buried in UI, hard to query or audit
- **Siloed** — each form lives in a different system with no unified data layer

The root cause: forms exist because computers can't understand human intent. LLMs changed that.

---

## Solution

**Formless** replaces forms with natural language intake. Users describe what they need in plain
English (or via voice, email, Slack). Formless classifies the request, extracts structured data,
validates it against a schema, and routes it to the right destination.

No forms. No fields. No training required.

---

## Target User

### Primary: Internal Operations / IT Teams
- Maintain 10–100+ internal forms
- Responsible for helpdesk tickets, HR intake, procurement, incident reporting
- Pain: form maintenance, inconsistent data quality, user complaints

### Secondary: End Users (Employees / Requesters)
- Fill out forms today under duress
- Want to "just tell someone what they need" and have it handled
- Not technical — conversational input is natural for them

### Tertiary: Admins / Workflow Designers
- Define what data needs to be captured (the schema)
- Set up routing rules and integrations
- Currently use ServiceNow, Jira, Zendesk, Monday, or spreadsheets

---

## Core Concepts

### Schema
A typed definition of the data to be captured. Example:

```
IT Ticket:
  - title: string (required)
  - description: string (required)
  - category: enum [hardware, software, access, network, other]
  - priority: enum [low, medium, high, critical]
  - requester: string (required)
  - affected_system: string (optional)
```

Schemas are defined by admins in plain English — Formless generates the structured schema.

### Intake
A natural language submission from an end user. Example:
> "My laptop won't connect to VPN and I have a client call in an hour. This is urgent."

Formless maps this to the IT Ticket schema:
```json
{
  "title": "VPN connection failure",
  "description": "Laptop unable to connect to VPN. Client call in 1 hour.",
  "category": "network",
  "priority": "critical",
  "requester": "auto-detected from session",
  "affected_system": "VPN / Laptop"
}
```

### Workspace
A team's Formless environment. Contains schemas, intake history, members, and integrations.

### Routing
Where a completed, validated record gets sent: Jira ticket, Slack message, email, webhook, database row, etc.

---

## MVP Feature Set (v1)

### Must Have
- [ ] Schema builder: define a schema in plain English → Formless generates structured definition
- [ ] Intake form: natural language text box where end users submit requests
- [ ] AI classification + extraction: map input to correct schema and extract fields
- [ ] Validation: reject or clarify inputs that don't satisfy required fields
- [ ] Record list: admin view of all submitted intakes with status
- [ ] Record detail: view the structured JSON + original natural language input
- [ ] Basic routing: webhook output (POST structured JSON to a URL)
- [ ] Authentication: workspace login (email/password or Google OAuth)

### Nice to Have (v1.1)
- [ ] Slack intake: submit via Slack message in a designated channel
- [ ] Email intake: forward an email, Formless parses it
- [ ] Clarification loop: if required fields are missing, AI asks follow-up questions
- [ ] Jira integration: create a Jira issue directly from a validated record
- [ ] Export: download records as CSV or JSON

### Out of Scope (v2+)
- Voice intake
- Multi-language support
- Custom UI theming
- Mobile app
- Analytics dashboard
- Role-based permissions beyond admin/user

---

## User Flows

### Flow 1: Admin sets up a schema
1. Admin logs into Formless workspace
2. Navigates to "Schemas" → "New Schema"
3. Types: "I need to capture IT support tickets with a title, description, category (hardware/software/network/access/other), priority, and the name of the affected system"
4. Formless generates the schema definition and shows a preview
5. Admin confirms and publishes
6. Formless generates a unique intake URL for this schema

### Flow 2: End user submits an intake
1. User opens the intake URL (or Slack channel)
2. Types their request in plain English
3. Formless classifies, extracts, and validates
4. If all required fields are present: record is saved, user sees confirmation
5. If fields are missing: Formless asks a targeted follow-up question
6. Record is routed (webhook, Jira, etc.)

### Flow 3: Admin reviews records
1. Admin views record list filtered by schema, status, date
2. Clicks a record to see: original text + extracted JSON side by side
3. Can manually edit a field if AI got something wrong
4. Can change status (open → in progress → resolved)

---

## Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Schema setup time | < 5 minutes for a new schema |
| Field extraction accuracy | > 90% on required fields |
| User completion rate | > 85% (vs. ~60% for traditional forms) |
| Time to first submission | < 10 minutes after account creation |

---

## Tech Stack (Proposed)

See `docs/ARCHITECTURE.md` for full details.

- **Frontend:** Next.js 14 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Next.js API routes or separate Node/Deno service
- **AI:** Claude API (claude-sonnet-4-6) for classification + extraction
- **Validation:** Zod schemas (proven in nlp-cms prototype)
- **Database:** PostgreSQL (Supabase for MVP speed)
- **Auth:** Clerk or Supabase Auth
- **Deployment:** Vercel

---

## Open Questions

1. **Schema versioning:** when a schema changes, what happens to existing records?
2. **Conflict resolution:** what if the AI extracts a field value that contradicts another field?
3. **Multi-schema routing:** can one intake match multiple schemas?
4. **Pricing model:** per workspace seat, per submission, or flat monthly?
5. **On-prem option:** will enterprise buyers require data to stay on their infrastructure?
