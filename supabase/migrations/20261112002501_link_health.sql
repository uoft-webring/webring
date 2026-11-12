-- Link health: how each ring site answered its last check, plus a 90-day log for uptime stats.
-- A site that fails to load on two checks in a row is skipped by /redirect until it loads again
-- (DOWN_AFTER_FAILED_CHECKS in lib/profiles/ring.ts); down sites are re-checked daily so they rejoin fast.

alter table public.ring_link_state
    add column last_http_status integer,
    add column last_latency_ms integer,
    add column consecutive_unreachable integer not null default 0;

create table public.ring_check_log (
    -- Surrogate key: now() is per transaction, so two checks in one transaction share a timestamp
    id bigint generated always as identity primary key,
    profile_id uuid not null references public.profile (id) on delete cascade,
    checked_at timestamptz not null default now(),
    result text not null check (result in ('found', 'partial', 'wrong_id', 'missing', 'js_rendered', 'unreachable')),
    -- null when no HTTP response came back (DNS failure, timeout, blocked address)
    http_status integer,
    latency_ms integer
);
create index ring_check_log_profile_checked on public.ring_check_log (profile_id, checked_at);
comment on table public.ring_check_log is 'Every ring site check, kept 90 days, for uptime and latency stats';

alter table public.ring_check_log enable row level security;
revoke all on table public.ring_check_log from anon, authenticated;

-- Same as before, plus the response details and the log. Defaults keep callers without them working.
drop function public.record_ring_check(uuid, text);
create function public.record_ring_check(member uuid, result text, status_code integer default null, elapsed_ms integer default null)
returns table (consecutive_failures integer, last_click_verified_at timestamptz)
language sql
set search_path = ''
as $$
    with logged as (
        insert into public.ring_check_log (profile_id, result, http_status, latency_ms)
        values (member, record_ring_check.result, status_code, elapsed_ms)
    ), pruned as (
        delete from public.ring_check_log l
        where l.profile_id = member and l.checked_at < now() - interval '90 days'
    )
    insert into public.ring_link_state as s
        (profile_id, last_checked_at, last_result, consecutive_failures, last_http_status, last_latency_ms, consecutive_unreachable)
    values (
        member, now(), record_ring_check.result,
        case when record_ring_check.result = 'found' then 0 else 1 end,
        status_code, elapsed_ms,
        case when record_ring_check.result = 'unreachable' then 1 else 0 end
    )
    on conflict (profile_id) do update set
        last_checked_at = now(),
        last_result = excluded.last_result,
        consecutive_failures = case when excluded.last_result = 'found' then 0 else s.consecutive_failures + 1 end,
        last_http_status = excluded.last_http_status,
        last_latency_ms = excluded.last_latency_ms,
        consecutive_unreachable = case when excluded.last_result = 'unreachable' then s.consecutive_unreachable + 1 else 0 end
    returning s.consecutive_failures, s.last_click_verified_at;
$$;

-- Every site /redirect can land on (any http(s) domain, not only connected ones) is due weekly;
-- a site that's down is due again after 20 hours, so it rejoins the ring within a day of coming back.
create or replace function public.ring_checks_due(max_count integer)
returns table (id uuid, ring_id integer, domain text, status public.validation_state)
language sql
stable
set search_path = ''
as $$
    select p.id, p.ring_id, p.domain, p.validated_user_component
    from public.profile p
    left join public.ring_link_state s on s.profile_id = p.id
    where p.domain ~ '^https?://'
      and (s.last_checked_at is null
           or s.last_checked_at < now() - interval '6 days'
           or (s.consecutive_unreachable > 0 and s.last_checked_at < now() - interval '20 hours'))
    order by s.last_checked_at nulls first, p.ring_id
    limit max_count;
$$;

revoke execute on function public.record_ring_check(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.record_ring_check(uuid, text, integer, integer) to service_role;
