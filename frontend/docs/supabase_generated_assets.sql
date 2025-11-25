create table if not exists generated_assets (
  id uuid primary key default gen_random_uuid(),
  language_slug text not null,
  topic_id text not null,
  asset_type text not null,
  content jsonb not null,
  audio_url text,
  config_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists generated_assets_unique
on generated_assets(language_slug, topic_id, asset_type, coalesce(config_hash, ''));
