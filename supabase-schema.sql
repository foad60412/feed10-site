create extension if not exists "pgcrypto";

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text not null,
  goal_usd numeric not null default 500,
  families_target integer not null default 10,
  basket_min_usd numeric not null default 30,
  basket_max_usd numeric not null default 40,
  status text not null default 'active' check (status in ('active','closed')),
  created_at timestamptz not null default now()
);

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  donor_name text,
  show_name boolean not null default false,
  amount_usd numeric not null,
  currency text not null default 'USD',
  status text not null default 'created',
  paypal_order_id text,
  paypal_capture_id text,
  created_at timestamptz not null default now()
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  country text,
  user_agent text,
  created_at timestamptz not null default now()
);

insert into campaigns (title, slug, description, goal_usd, families_target, basket_min_usd, basket_max_usd, status)
values ('Feed 10 Families in Palestine', 'feed-10-families', 'Help us provide essential food baskets to 10 families in need inside Palestine. Every donation, even $5, helps.', 500, 10, 30, 40, 'active')
on conflict (slug) do nothing;

alter table campaigns enable row level security;
alter table donations enable row level security;
alter table visits enable row level security;
