-- Ring invite candidates found on GitHub; emailed at most once, after owner approval (server only)
create table public.invite_candidate (
    id uuid primary key default gen_random_uuid(),
    github_login text not null unique,
    name text,
    -- Public GitHub profile email; unique so nobody is re-added under a second account
    email text not null unique,
    website text not null,
    bio text,
    status text not null default 'pending'
        check (status in ('pending', 'approved', 'rejected', 'invited', 'opted_out')),
    found_at timestamptz not null default now(),
    invited_at timestamptz
);

alter table public.invite_candidate enable row level security;
revoke all on table public.invite_candidate from anon, authenticated;

-- Adds new candidates, silently skipping anyone already known by GitHub login or email (any status),
-- so rejected or opted-out people are never re-added. Returns how many were added.
create function public.add_invite_candidates(candidates jsonb)
returns integer
language sql
set search_path = ''
as $$
    with added as (
        insert into public.invite_candidate (github_login, name, email, website, bio)
        select c.github_login, c.name, c.email, c.website, c.bio
        from jsonb_to_recordset(candidates) as c(github_login text, name text, email text, website text, bio text)
        on conflict do nothing
        returning 1
    )
    select count(*)::integer from added;
$$;

-- Claims up to `max_count` approved candidates and marks them invited in the same statement, so
-- overlapping or repeated runs can never email anyone twice. `dry_run` only lists them.
create function public.claim_invites(max_count integer, dry_run boolean)
returns table (id uuid, email text, name text, website text)
language sql
set search_path = ''
as $$
    with due as (
        select c.id
        from public.invite_candidate c
        where c.status = 'approved'
        order by c.found_at
        limit max_count
        for update skip locked
    ),
    -- Data-modifying CTEs always run, even though the select below doesn't read this one
    stamped as (
        update public.invite_candidate c
        set status = 'invited', invited_at = now()
        from due
        where c.id = due.id and not dry_run
        returning c.id
    )
    select c.id, c.email, c.name, c.website
    from public.invite_candidate c
    join due on due.id = c.id
    order by c.found_at;
$$;

revoke execute on function public.add_invite_candidates(jsonb) from public, anon, authenticated;
grant execute on function public.add_invite_candidates(jsonb) to service_role;
revoke execute on function public.claim_invites(integer, boolean) from public, anon, authenticated;
grant execute on function public.claim_invites(integer, boolean) to service_role;
