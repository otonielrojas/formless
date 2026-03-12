# Formless — Brainstorm & Ideation

> Saved from initial planning session — 2026-03-12

---

## Origin

Started from a prototype called `nlp-cms` (Dec 2024) — a proof of concept showing that
natural language input could be classified by an LLM and mapped to validated, typed JSON
objects (events, articles, notes) using Zod schemas.

The core loop:
```
natural language input
  → AI classifies type (event | article | note)
  → AI extracts structured fields
  → Zod validates against typed schema
  → clean JSON stored in DB
```

The narration written for the prototype demo said it best:
> "Bridging the gap between how humans naturally communicate and how computers need data to be structured."

---

## The Core Insight

**Forms are a hack.** They exist because computers can't understand intent. With LLMs, they don't have to.

WordPress's genius was abstracting HTML into posts/pages/fields.
Formless abstracts *intent* into structured data — replacing forms with conversation.

---

## Initial Brainstorm (Three Angles)

### Angle 1: No-Code AI Site Builder (Path B — future)
Target: Small businesses, freelancers, non-technical founders
- You describe your site in plain English
- AI builds pages, content model, and layout
- You edit via chat: "Make the hero headline more urgent", "Add a testimonials section"
- Publish to static hosting (Vercel/Netlify) in one click
- Closest comp: Webflow + Framer, but conversation-first

### Angle 2: AI-Powered Headless CMS (Path B extension)
Target: Dev teams who want Contentful/Sanity but faster schema design
- Describe your content model in plain English → AI generates the schema
- Chat with your content: "Find all blog posts about React published this year"
- AI auto-generates migrations when schema changes
- Delivers a REST/GraphQL API
- Closest comp: Sanity + Contentful, but AI-native schema design

### Angle 3: Enterprise Form Replacement (Path C — THIS PROJECT)
Target: Internal ops/IT teams drowning in form maintenance
- Replace internal forms, ticketing systems, intake workflows with natural language
- "Ticket systems, document management, knowledge bases — anywhere we need structured data input"
- Zero training required for end users
- Closest comp: ServiceNow, Jira forms — but conversation-first
- Revenue: $500–$5000/mo per team

---

## Why Path C First

- Highest ACV (annual contract value) of the three paths
- Clearest pain: ops/IT teams maintain dozens of brittle forms
- Fastest adoption signal: replace ONE internal form, prove ROI immediately
- Enterprise buyers pay before you're perfect
- Defensible: schema enforcement + validation = not just ChatGPT in a box

---

## What Makes Formless Defensible vs. Just Using ChatGPT

The critical differentiator is the **schema enforcement + validation layer**:

1. **Guaranteed structure** — validation means output always fits the schema, or it fails gracefully
2. **Queryable data** — typed JSON means you can filter/sort/aggregate like a real database
3. **Audit trail** — every AI action produces a diff, not a black box
4. **Idempotency** — same input reliably produces the same schema shape
5. **Integrations** — connects to existing enterprise systems (Jira, ServiceNow, Slack, email)

ChatGPT gives you prose. Formless gives you a structured, validated, API-ready data record.

---

## The Conversational Edit Loop (Key Unsolved Problem)

The prototype handles: input → structured output.
A real product also needs **editing**:

- "Change the priority to urgent" → patches only `priority` field
- "Assign this to the infrastructure team" → updates `assignee` field
- "This is actually a billing issue, not a tech issue" → reclassifies type + re-validates

This requires stateful conversation with schema awareness — the AI needs to know:
1. The existing record
2. The schema constraints
3. The patch to apply (not a full rewrite)

This is the core R&D challenge of the product.

---

## The Bigger Vision (2–3 year horizon)

**"Describe your data. We'll build the database."**

Any domain where structured data input exists today can be replaced:
- IT helpdesk tickets
- HR onboarding/intake
- Legal contract intake
- Insurance claims
- Patient intake (healthcare)
- Customer support tickets
- Procurement requests
- Incident reports

The schema becomes the product. The natural language is just the interface.

---

## Competitive Landscape

| Competitor | Weakness Formless Exploits |
|------------|---------------------------|
| ServiceNow | Expensive, complex, requires consultants |
| Jira Forms | Developer-centric, not conversation-native |
| Typeform | Still forms — just prettier ones |
| Google Forms | Zero intelligence, manual structure |
| Microsoft Forms + Copilot | Surface-level AI, not schema-native |
| Notion AI | General purpose, not structured data focused |

---

## Revenue Model Ideas

- **Per workspace/seat:** $500–$2000/mo for team plans
- **Per schema/workflow:** $X per active form replaced
- **Enterprise contract:** Annual deal, custom pricing
- **Usage-based:** Per AI parse/classification above a free tier
