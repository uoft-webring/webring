-- "Is your profile up to date?" emails: at most one per member every 8 months, sent by /api/cron/reminders.
-- A separate table rather than profile columns: updating a legacy profile row re-checks the
-- NOT VALID constraints it predates, which would fail the claim (and unsubscribes) for those members.
create table public.member_email_pref (
    profile_id uuid primary key references public.profile (id) on delete cascade,
    last_reminded_at timestamptz,
    opted_out boolean not null default false
);
comment on table public.member_email_pref is 'Reminder email state per member, written by the server only';

alter table public.member_email_pref enable row level security;
revoke all on table public.member_email_pref from anon, authenticated;

-- Claims up to `max_count` members who are due a reminder and stamps them in the same statement,
-- so overlapping or repeated runs can never email anyone twice. `dry_run` only lists them.
-- SQL (not plpgsql) so the output column names can't clash with table columns.
create function public.claim_profile_reminders(max_count integer, dry_run boolean)
returns table (
    id uuid,
    email text,
    name text,
    domain text,
    slug text,
    tagline text,
    image_key text,
    tags text[],
    ring_status public.validation_state,
    previous_reminded_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
    with due as (
        select p.id, pref.last_reminded_at
        from public.profile p
        join auth.users u on u.id = p.id
        left join public.member_email_pref pref on pref.profile_id = p.id
        where not coalesce(pref.opted_out, false)
          and p.email is not null
          -- First reminder 8 months after joining, then every 8 months
          and coalesce(pref.last_reminded_at, u.created_at) < now() - interval '8 months'
        order by p.ring_id
        limit max_count
        -- Locks only (no update), so legacy profile rows are fine; skip rows another run holds
        for update of p skip locked
    ),
    -- Data-modifying CTEs always run, even though the select below doesn't read this one
    stamped as (
        insert into public.member_email_pref as pref (profile_id, last_reminded_at)
        select due.id, now() from due where not dry_run
        on conflict (profile_id) do update set last_reminded_at = excluded.last_reminded_at
        -- Re-checked against the latest committed row: if an overlapping run stamped this member
        -- (or they opted out) after our snapshot, skip them instead of emailing twice
        where not pref.opted_out
          and (pref.last_reminded_at is null or pref.last_reminded_at < now() - interval '8 months')
        returning pref.profile_id
    )
    select p.id, p.email, p.name, p.domain, p.slug, p.tagline, p.image_key, p.tags,
           p.validated_user_component, due.last_reminded_at
    from public.profile p
    join due on due.id = p.id
    -- Sends only go to members this run actually stamped
    where dry_run or p.id in (select profile_id from stamped)
    order by p.ring_id;
$$;

revoke execute on function public.claim_profile_reminders(integer, boolean) from public, anon, authenticated;
grant execute on function public.claim_profile_reminders(integer, boolean) to service_role;
