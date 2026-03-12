-- Formless — Initial Schema
-- Run this in your Supabase SQL editor to set up the database

-- ─── Workspaces ───────────────────────────────────────────────────────────────
create table workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ─── Workspace members ────────────────────────────────────────────────────────
create table workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'admin' check (role in ('admin', 'member')),
  created_at    timestamptz not null default now(),
  unique (workspace_id, user_id)
);

-- ─── Schemas ──────────────────────────────────────────────────────────────────
create table schemas (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  name          text not null,
  description   text not null default '',
  definition    jsonb not null,         -- SchemaDefinition type
  intake_token  text not null unique default encode(gen_random_bytes(16), 'hex'),
  version       integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Records ──────────────────────────────────────────────────────────────────
create table records (
  id              uuid primary key default gen_random_uuid(),
  schema_id       uuid not null references schemas(id) on delete cascade,
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  raw_input       text not null,
  extracted_data  jsonb not null,
  schema_version  integer not null default 1,
  status          text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Record edits (audit trail) ───────────────────────────────────────────────
create table record_edits (
  id          uuid primary key default gen_random_uuid(),
  record_id   uuid not null references records(id) on delete cascade,
  user_id     uuid references auth.users(id),
  field_name  text not null,
  old_value   jsonb,
  new_value   jsonb,
  created_at  timestamptz not null default now()
);

-- ─── Intake sessions (clarification loop state) ───────────────────────────────
create table intake_sessions (
  id            uuid primary key default gen_random_uuid(),
  schema_id     uuid not null references schemas(id) on delete cascade,
  session_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  messages      jsonb not null default '[]',
  status        text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table schemas enable row level security;
alter table records enable row level security;
alter table record_edits enable row level security;
alter table intake_sessions enable row level security;

-- Workspace members can see their workspace
create policy "Members can view their workspace"
  on workspaces for select
  using (
    id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );

-- Members can view/manage schemas in their workspace
create policy "Members can view schemas"
  on schemas for select
  using (
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Admins can insert schemas"
  on schemas for insert
  with check (
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Records: members can view, anyone with intake token can insert (handled in API)
create policy "Members can view records"
  on records for select
  using (
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );

-- Intake sessions: public insert allowed (intake URL is the access control)
-- Records insert: handled via service role key in API routes

-- ─── Useful indexes ───────────────────────────────────────────────────────────
create index on schemas (workspace_id);
create index on schemas (intake_token);
create index on records (schema_id);
create index on records (workspace_id);
create index on records (status);
create index on intake_sessions (session_token);
