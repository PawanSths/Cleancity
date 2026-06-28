create extension if not exists "pgcrypto";
create extension if not exists "postgis";

create type public.user_role as enum ('citizen', 'staff', 'admin');
create type public.complaint_category as enum ('garbage', 'pothole', 'drainage', 'sewage', 'graffiti', 'other');
create type public.complaint_status as enum ('pending', 'in_progress', 'resolved');
create type public.severity_level as enum ('low', 'medium', 'high', 'critical');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'citizen',
  area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) between 6 and 120),
  description text not null check (char_length(description) between 12 and 1000),
  category public.complaint_category not null,
  status public.complaint_status not null default 'pending',
  severity public.severity_level not null default 'medium',
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location geography(point, 4326) generated always as (st_setsrid(st_makepoint(longitude, latitude), 4326)::geography) stored,
  address text,
  area text,
  image_url text not null,
  ai_summary text,
  ai_confidence numeric(4, 3) check (ai_confidence between 0 and 1),
  ai_spam_score numeric(4, 3) check (ai_spam_score between 0 and 1),
  is_anonymous boolean not null default false,
  assigned_to uuid references public.profiles(id) on delete set null,
  upvote_count integer not null default 0 check (upvote_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.complaint_upvotes (
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (complaint_id, user_id)
);

create table public.complaint_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index complaints_location_idx on public.complaints using gist (location);
create index complaints_status_idx on public.complaints (status);
create index complaints_category_idx on public.complaints (category);
create index complaints_area_idx on public.complaints (area);
create index complaints_created_at_idx on public.complaints (created_at desc);
create index complaint_events_complaint_id_idx on public.complaint_events (complaint_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger complaints_set_updated_at
before update on public.complaints
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.increment_upvote_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.complaints
  set upvote_count = upvote_count + 1
  where id = new.complaint_id;
  return new;
end;
$$;

create trigger complaint_upvote_inserted
after insert on public.complaint_upvotes
for each row execute function public.increment_upvote_count();

create or replace function public.decrement_upvote_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.complaints
  set upvote_count = greatest(0, upvote_count - 1)
  where id = old.complaint_id;
  return old;
end;
$$;

create trigger complaint_upvote_deleted
after delete on public.complaint_upvotes
for each row execute function public.decrement_upvote_count();

create or replace function public.is_admin_or_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_upvotes enable row level security;
alter table public.complaint_events enable row level security;

create policy "Profiles are publicly readable"
on public.profiles for select
using (true);

create policy "Users update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins manage profiles"
on public.profiles for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

create policy "Complaints are publicly readable"
on public.complaints for select
using (true);

create policy "Citizens insert own non-anonymous complaints"
on public.complaints for insert
with check (auth.uid() = user_id and is_anonymous = false);

create policy "Anyone can insert anonymous complaints"
on public.complaints for insert
with check (is_anonymous = true and user_id is null);

create policy "Users update their pending own complaints"
on public.complaints for update
using (auth.uid() = user_id and status = 'pending')
with check (auth.uid() = user_id);

create policy "Admins and staff manage complaints"
on public.complaints for update
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

create policy "Users can upvote once"
on public.complaint_upvotes for insert
with check (auth.uid() = user_id);

create policy "Users can read upvotes"
on public.complaint_upvotes for select
using (true);

create policy "Users can remove own upvotes"
on public.complaint_upvotes for delete
using (auth.uid() = user_id);

create policy "Events readable by admins"
on public.complaint_events for select
using (public.is_admin_or_staff());

create policy "Events writable by admins"
on public.complaint_events for insert
with check (public.is_admin_or_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-photos',
  'complaint-photos',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view complaint photos"
on storage.objects for select
using (bucket_id = 'complaint-photos');

create policy "Authenticated users can upload complaint photos"
on storage.objects for insert
with check (
  bucket_id = 'complaint-photos'
  and auth.role() in ('authenticated', 'anon')
);

alter publication supabase_realtime add table public.complaints;
