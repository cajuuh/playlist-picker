-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create table if not exists youtube_auth (
  id int primary key default 1,
  tokens jsonb not null,
  updated_at timestamptz not null default now(),
  constraint youtube_auth_singleton check (id = 1)
);

create table if not exists submissions (
  phone text primary key,
  name text not null,
  tracks jsonb not null default '[]'::jsonb,
  reserved int not null default 0,
  updated_at timestamptz not null default now()
);

-- Atomically reserves `p_count` slots for a phone number, creating its row
-- if needed. Returns false if fewer than `p_count` slots remain out of 2.
-- The UPDATE takes a row lock in Postgres, so two concurrent submissions
-- for the same phone (from separate serverless invocations) can't both
-- slip past the limit the way an in-process JS check would allow.
create or replace function reserve_slots(p_phone text, p_name text, p_count int)
returns boolean
language plpgsql
as $$
declare
  did_reserve boolean;
begin
  insert into submissions (phone, name)
  values (p_phone, p_name)
  on conflict (phone) do nothing;

  update submissions
  set reserved = reserved + p_count,
      name = coalesce(nullif(p_name, ''), name),
      updated_at = now()
  where phone = p_phone
    and (jsonb_array_length(tracks) + reserved + p_count) <= 2
  returning true into did_reserve;

  return coalesce(did_reserve, false);
end;
$$;

create or replace function commit_track(p_phone text, p_track jsonb)
returns void
language sql
as $$
  update submissions
  set tracks = tracks || jsonb_build_array(p_track),
      reserved = greatest(reserved - 1, 0),
      updated_at = now()
  where phone = p_phone;
$$;

create or replace function release_reservation(p_phone text, p_count int)
returns void
language sql
as $$
  update submissions
  set reserved = greatest(reserved - p_count, 0)
  where phone = p_phone;
$$;

-- Row Level Security with no policies = deny-all for the anon/authenticated
-- roles. Only the service-role key (used server-side by the API routes,
-- never exposed to the browser) can read or write these tables — it
-- bypasses RLS by design.
alter table youtube_auth enable row level security;
alter table submissions enable row level security;
