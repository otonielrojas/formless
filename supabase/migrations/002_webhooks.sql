-- Formless — Webhook Routing (Phase 2.2)

-- ─── Add webhook_url to schemas ───────────────────────────────────────────────
alter table schemas add column if not exists webhook_url text;

-- ─── Webhook deliveries log ───────────────────────────────────────────────────
create table webhook_deliveries (
  id           uuid primary key default gen_random_uuid(),
  schema_id    uuid not null references schemas(id) on delete cascade,
  record_id    uuid references records(id) on delete set null,
  webhook_url  text not null,
  status       text not null check (status in ('success', 'failed')),
  http_status  integer,
  attempts     integer not null default 1,
  error        text,
  created_at   timestamptz not null default now()
);

create index on webhook_deliveries (schema_id);
create index on webhook_deliveries (record_id);
create index on webhook_deliveries (created_at desc);

-- RLS: members can view deliveries for their workspace's schemas
alter table webhook_deliveries enable row level security;

create policy "Members can view webhook deliveries"
  on webhook_deliveries for select
  using (
    schema_id in (
      select s.id from schemas s
      join workspace_members wm on wm.workspace_id = s.workspace_id
      where wm.user_id = auth.uid()
    )
  );

-- Admins can update webhook_url on schemas they own
create policy "Admins can update schemas"
  on schemas for update
  using (
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid() and role = 'admin'
    )
  );
