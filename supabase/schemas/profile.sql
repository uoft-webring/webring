create type validation_state as enum ('disconnected', 'pending', 'connected');

-- Create profile table 
create table public.profile (
    id uuid references auth.users not null primary key, -- auth.users uuid, will be used to build txt_record
    email text, -- user email
    domain text default '', -- user domain
    name text, -- user name
    ring_id serial, -- id to identify user domain on the webring
    validated_user_component validation_state default 'disconnected', -- check if user domain is "valid", contains either "disconnected", "pending" or "connected"
    tagline text default '',
    image_key text default '',
    is_verified boolean default false,
    github_url text default '',
    tags text[3] default array[]::text[],
    graduation_year int,
    program text,
    slug text unique,
    open_to_work boolean not null default false, -- looking for co-op / internship roles
    constraint profile_ring_id_key unique (ring_id),
    -- Mirrors lib/validation.ts. Added NOT VALID in production so legacy rows are left untouched.
    constraint profile_domain_format check (domain ~ '^(https?://[^[:space:]]+)?$' and length(domain) <= 255),
    constraint profile_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 40),
    constraint profile_name_length check (length(name) between 1 and 80),
    constraint profile_tagline_length check (length(tagline) <= 255),
    constraint profile_tags_limit check (coalesce(cardinality(tags), 0) <= 3),
    constraint profile_image_key_format check (image_key ~ '^([A-Za-z0-9_-]+\.avif)?$'),
    constraint profile_github_format check (btrim(github_url) ~ '^([A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38})?$'),
    constraint profile_program_length check (length(program) between 2 and 60)
);
comment on table public.profile is 'Table to store user data';

-- Enable row level security for public.profile
alter table profile enable row level security;

-- Create RLS policies
create policy "Allow user to read access their own profile" on public.profile 
    for select using (auth.uid() = id);
create policy "Allow user to edit their own profile" on public.profile 
    for update using (auth.uid() = id);

-- Members edit only their profile fields; verification state is written by the server (service role).
revoke all on table public.profile from anon, authenticated;
grant select on table public.profile to authenticated;
grant update (name, domain, tagline, image_key, github_url, tags, graduation_year, program, slug, open_to_work)
    on table public.profile to authenticated;

-- A new domain needs to be re-verified and re-linked
create function public.reset_profile_verification()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.domain is distinct from old.domain then
        new.is_verified := false;
        new.validated_user_component := 'disconnected';
    end if;
    return new;
end;
$$;

create trigger on_profile_domain_change
    before update of domain on public.profile
    for each row execute function public.reset_profile_verification();

-- Start ring_id sequence at 0
alter sequence profile_ring_id_seq minvalue 0 start 0 restart with 0;





