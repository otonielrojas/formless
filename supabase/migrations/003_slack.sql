-- Formless — Slack Integration (Phase 2.3)

-- Add slack_channel_id to schemas (one channel maps to one schema)
alter table schemas add column if not exists slack_channel_id text;

-- Index for fast lookup when an event comes in
create index if not exists schemas_slack_channel_id_idx
  on schemas (slack_channel_id)
  where slack_channel_id is not null;
