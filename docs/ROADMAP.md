# Formless — Roadmap

> Last updated: 2026-03-12

---

## Phase 0: Foundation (Current)
**Goal:** Repo setup, planning, architecture decisions

- [x] Project created, git initialized
- [x] Brainstorm saved
- [x] PRD written
- [ ] Architecture documented
- [ ] Tech stack finalized
- [ ] Scaffold Next.js app

---

## Phase 1: Core MVP
**Goal:** One schema, one intake flow, one admin view. Prove the core loop works end-to-end.

### 1.1 Schema Builder
- [ ] Admin can describe a schema in plain English
- [ ] AI generates structured schema definition (field name, type, required, enum values)
- [ ] Admin can review and confirm the generated schema
- [ ] Schema is saved and gets a unique intake URL

### 1.2 Intake Engine
- [ ] End user opens intake URL
- [ ] Free-text input field (web UI)
- [ ] AI classifies input against the schema
- [ ] AI extracts field values from natural language
- [ ] Zod validates extracted data against schema
- [ ] Successful record is saved to DB
- [ ] User sees confirmation with a summary of what was captured

### 1.3 Clarification Loop
- [ ] If required fields are missing, AI generates a targeted follow-up question
- [ ] User answers the follow-up
- [ ] System merges answer with original extraction and re-validates

### 1.4 Admin Record View
- [ ] List of all records for a schema (paginated)
- [ ] Record detail: original text + extracted JSON side by side
- [ ] Manual field edit (override AI extraction)
- [ ] Status management: open → in progress → resolved

### 1.5 Auth
- [ ] Workspace creation (sign up)
- [ ] Login / logout
- [ ] Admin vs. end-user role distinction

---

## Phase 2: Integrations & Channels
**Goal:** Meet users where they already work.

### 2.1 Webhook Routing
- [ ] Admin configures a webhook URL per schema
- [ ] On successful intake, POST structured JSON to webhook
- [ ] Retry logic on failure
- [ ] Webhook delivery log in admin panel

### 2.2 Slack Integration
- [ ] Connect a Slack workspace
- [ ] Designate a channel per schema
- [ ] Messages in that channel are processed as intakes
- [ ] Bot replies with confirmation + extracted summary

### 2.3 Email Integration
- [ ] Unique email address per schema (e.g., it-tickets@formless.app)
- [ ] Forward or send to that address = intake submission
- [ ] Parse email body + subject as natural language input

### 2.4 Jira Integration
- [ ] Connect Jira account
- [ ] Map Formless fields → Jira fields
- [ ] Create Jira issue on successful intake

---

## Phase 3: Intelligence & Quality
**Goal:** Make the AI smarter, more reliable, more auditable.

### 3.1 Extraction Confidence Scores
- [ ] AI reports confidence per extracted field
- [ ] Low-confidence fields flagged for human review
- [ ] Admin dashboard shows accuracy metrics over time

### 3.2 Schema Versioning
- [ ] Schemas are versioned when edited
- [ ] Existing records retain the schema version they were captured against
- [ ] Migration tool to re-classify old records against new schema

### 3.3 Training Feedback Loop
- [ ] Admin corrections (manual edits) fed back as few-shot examples
- [ ] Per-workspace prompt tuning based on correction history

### 3.4 Conversational Edit
- [ ] Users can follow up: "Actually, change the priority to critical"
- [ ] AI applies targeted patch to existing record
- [ ] Full edit history / audit log

---

## Phase 4: Enterprise Readiness
**Goal:** Close bigger deals.

- [ ] SSO (SAML/OIDC) for enterprise login
- [ ] Role-based access control (RBAC)
- [ ] Data retention policies
- [ ] SOC 2 compliance path
- [ ] On-prem / self-hosted option
- [ ] SLA and uptime guarantees
- [ ] Custom AI model option (bring your own key)
- [ ] Advanced analytics: volume, accuracy, time-to-resolution

---

## Phase 5: Platform
**Goal:** Let others build on top of Formless.

- [ ] Public API + SDK
- [ ] Marketplace of pre-built schemas (IT tickets, HR intake, etc.)
- [ ] No-code workflow builder (if X is submitted → do Y)
- [ ] White-label option for system integrators

---

## Parking Lot (Not Yet Scheduled)

- Voice intake (phone call → structured record)
- Multi-language support
- Mobile app
- AI-suggested schema improvements based on intake patterns
- Duplicate detection across intakes
- SLA tracking and escalation rules
