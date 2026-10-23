-- Harden public.profile against direct PostgREST writes and sync the email gate with production.

-- 1. UofT email gate.
-- Production had drifted to a plain suffix check (accepts look-alikes such as x@evilutoronto.ca).
-- Allow utoronto.ca and its mail/alum/alumni subdomains only.
create or replace function public.check_uoft_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if lower(new.email) ~ '^[^@[:space:]]+@((mail|alum|alumni)\.)?utoronto\.ca$' then
        return new;
    end if;
    return null;
end;
$$;

-- 2. Column-level privileges.
-- Previously `authenticated` could UPDATE every column of its own row (is_verified, ring_id, ...),
-- and anon/authenticated held INSERT/DELETE/TRUNCATE. Members may only edit their profile fields;
-- verification state is written by the server with the service role.
revoke all on table public.profile from anon, authenticated;
grant select on table public.profile to authenticated;
grant update (name, domain, tagline, image_key, github_url, tags, graduation_year, program, slug)
    on table public.profile to authenticated;

-- 3. A new domain needs to be re-verified and re-linked, whoever performs the update.
create or replace function public.reset_profile_verification()
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

-- 4. Shape constraints mirroring lib/validation.ts.
-- NOT VALID: not checked against existing rows when added. Postgres still checks a row on any later
-- UPDATE, so every rule below is one all production rows satisfied when this was written.
alter table public.profile
    add constraint profile_domain_format
        check (domain ~ '^(https?://[^[:space:]]+)?$' and length(domain) <= 255) not valid,
    add constraint profile_slug_format
        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 40) not valid,
    add constraint profile_name_length check (length(name) between 1 and 80) not valid,
    add constraint profile_tagline_length check (length(tagline) <= 255) not valid,
    add constraint profile_tags_limit check (coalesce(cardinality(tags), 0) <= 3) not valid,
    add constraint profile_image_key_format check (image_key ~ '^([A-Za-z0-9_-]+\.avif)?$') not valid,
    -- btrim: a legacy username has trailing whitespace, and NOT VALID still re-checks a row on every update
    add constraint profile_github_format
        check (btrim(github_url) ~ '^([A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38})?$') not valid,
    add constraint profile_program_length check (length(program) between 2 and 60) not valid;
-- No graduation-year range in the DB: a legacy row holds 2222 and would block service-role writes to it.
-- lib/validation.ts still enforces 1900-2100 for anything members save.

-- The ring order relies on ring_id being unique.
alter table public.profile add constraint profile_ring_id_key unique (ring_id);

-- 5. The app no longer reads auth.users through a view; drop it so member emails have one less path out.
drop view if exists public.users;
