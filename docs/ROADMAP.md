# Formless — Roadmap

> Last updated: 2026-03-12

---

## Phase 0: Foundation ✅
**Goal:** Repo setup, planning, architecture decisions

- [x] Project created, git initialized
- [x] Brainstorm saved
- [x] PRD written
- [x] Architecture documented
- [x] Tech stack finalized
- [x] Scaffold Next.js app

---

## Phase 1: Core MVP ✅
**Goal:** One schema, one intake flow, one admin view. Prove the core loop works end-to-end.

### 1.1 Schema Builder ✅
- [x] Admin describes a schema in plain English
- [x] AI generates structured schema definition (field name, type, required, enum values)
- [x] Admin reviews and confirms the generated schema
- [x] Schema saved with unique intake token

### 1.2 Intake Engine ✅
- [x] End user opens intake URL
- [x] Free-text input field (web UI)
- [x] AI classifies input against the schema
- [x] AI extracts field values from natural language
- [x] Zod validates extracted data against schema
- [x] Successful record saved to DB
- [x] User sees confirmation with summary of what was captured

### 1.3 Clarification Loop ✅
- [x] If required fields are missing, AI generates a targeted follow-up question
- [x] User answers the follow-up
- [x] System merges answer with original extraction and re-validates
- [x] Multi-turn: continues asking until all required fields are satisfied

### 1.4 Admin Record View ✅
- [x] List of all records for a workspace
- [x] Record detail: original text + extracted JSON side by side
- [x] Status management: open → in progress → resolved (click to cycle)

### 1.5 Schema Management ✅
- [x] Schema list with intake URL display
- [x] Schema delete with confirmation

### 1.6 Auth ✅
- [x] Workspace creation on signup
- [x] Login / logout
- [x] Email confirmation flow with callback
- [x] Admin vs end-user surface separation

---

## Phase 2: Integrations & Channels
**Goal:** Meet users where they already work.

### 2.1 Copy Intake URL
- [ ] One-click copy intake URL from schemas list
- [ ] Full shareable URL (not just the token path)

### 2.2 Webhook Routing
- [ ] Admin configures a webhook URL per schema
- [ ] On successful intake, POST structured JSON to webhook
- [ ] Retry logic on failure
- [ ] Webhook delivery log in admin panel

### 2.3 Slack Integration
- [ ] Connect a Slack workspace
- [ ] Designate a channel per schema
- [ ] Messages in that channel processed as intakes
- [ ] Bot replies with confirmation + extracted summary

### 2.4 Email Integration
- [ ] Unique email address per schema
- [ ] Forward or send to address = intake submission
- [ ] Parse email body + subject as natural language input

### 2.5 Jira Integration
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
- [ ] Schemas versioned when edited
- [ ] Existing records retain the schema version they were captured against
- [ ] Migration tool to re-classify old records against new schema

### 3.3 Training Feedback Loop
- [ ] Admin corrections fed back as few-shot examples
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
- [ ] No-code workflow builder (if X submitted → do Y)
- [ ] White-label option for system integrators

---

## Parking Lot (Not Yet Scheduled)

- Voice intake (phone call → structured record)
- Multi-language support
- Mobile app
- AI-suggested schema improvements based on intake patterns
- Duplicate detection across intakes
- SLA tracking and escalation rules
