-- Ring link verification state (server only); see the migration of the same name for details
create table public.ring_link_state (
    profile_id uuid primary key references public.profile (id) on delete cascade,
    last_checked_at timestamptz,
    last_result text check (last_result in ('found', 'partial', 'wrong_id', 'missing', 'js_rendered', 'unreachable')),
    consecutive_failures integer not null default 0,
    last_click_verified_at timestamptz,
    last_http_status integer,
    last_latency_ms integer,
    -- Checks in a row with no answer, a 5xx, or 404/410. A 401/403/429 is bot protection, not a dead site
    consecutive_down integer not null default 0
);

create table public.ring_check_log (
    -- Surrogate key: now() is per transaction, so two checks in one transaction share a timestamp
    id bigint generated always as identity primary key,
    profile_id uuid not null references public.profile (id) on delete cascade,
    checked_at timestamptz not null default now(),
    result text not null check (result in ('found', 'partial', 'wrong_id', 'missing', 'js_rendered', 'unreachable')),
    http_status integer,
    latency_ms integer
);
create index ring_check_log_profile_checked on public.ring_check_log (profile_id, checked_at);
comment on table public.ring_check_log is 'Every ring site check, kept 90 days, for uptime and latency stats';

comment on table public.ring_link_state is 'Ring widget checks per member, written by the server';

create table public.ring_click_evidence (
    profile_id uuid not null references public.profile (id) on delete cascade,
    -- sha256 of the client (IPv4 address or IPv6 /64) with a server secret; never the address itself
    client_hash text not null,
    seen_at timestamptz not null default now(),
    primary key (profile_id, client_hash)
);
comment on table public.ring_click_evidence is 'Hashed clients who clicked a member''s widget on their own site';

alter table public.ring_link_state enable row level security;
alter table public.ring_click_evidence enable row level security;
alter table public.ring_check_log enable row level security;
revoke all on table public.ring_link_state from anon, authenticated;
revoke all on table public.ring_click_evidence from anon, authenticated;
revoke all on table public.ring_check_log from anon, authenticated;

-- Called by /redirect (after the response) when a visitor arrives from the member's own site.
-- Two distinct clients within 30 days mark the member connected: one forged request isn't enough.
-- Returns whether the member is connected now.
create function public.record_widget_click(member_ring_id integer, client text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
    member uuid;
    clients integer;
begin
    select p.id into member from public.profile p where p.ring_id = member_ring_id;
    if member is null then
        return false;
    end if;

    insert into public.ring_click_evidence as e (profile_id, client_hash)
    values (member, client)
    on conflict (profile_id, client_hash) do update set seen_at = now();

    delete from public.ring_click_evidence e
    where e.profile_id = member and e.seen_at < now() - interval '30 days';

    select count(*) into clients from public.ring_click_evidence e where e.profile_id = member;
    if clients < 2 then
        return false;
    end if;

    insert into public.ring_link_state as s (profile_id, last_click_verified_at)
    values (member, now())
    on conflict (profile_id) do update set last_click_verified_at = now(), consecutive_down = 0;

    update public.profile p
    set validated_user_component = 'connected'
    where p.id = member and p.validated_user_component is distinct from 'connected';

    return true;
end;
$$;

-- Records an HTML check of a member's widget. Returns the failure streak and last click confirmation
-- so the weekly job can decide whether a connected member really lost their widget.
create function public.record_ring_check(member uuid, result text, status_code integer default null, elapsed_ms integer default null)
returns table (consecutive_failures integer, last_click_verified_at timestamptz, consecutive_down integer)
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
        (profile_id, last_checked_at, last_result, consecutive_failures, last_http_status, last_latency_ms, consecutive_down)
    values (
        member, now(), record_ring_check.result,
        -- An outage says nothing about the widget: it has its own streak below
        case when record_ring_check.result in ('found', 'unreachable') then 0 else 1 end,
        status_code, elapsed_ms,
        case when record_ring_check.result = 'unreachable'
              and (status_code is null or status_code >= 500 or status_code in (404, 410)) then 1 else 0 end
    )
    on conflict (profile_id) do update set
        last_checked_at = now(),
        last_result = excluded.last_result,
        consecutive_failures = case excluded.last_result
            when 'found' then 0
            when 'unreachable' then s.consecutive_failures
            else s.consecutive_failures + 1 end,
        last_http_status = excluded.last_http_status,
        last_latency_ms = excluded.last_latency_ms,
        -- excluded.consecutive_down is 1 exactly when this check counts as down
        consecutive_down = case when excluded.consecutive_down = 1 then s.consecutive_down + 1 else 0 end
    returning s.consecutive_failures, s.last_click_verified_at, s.consecutive_down;
$$;

-- Members due a weekly re-check: in (or waiting for) the ring, not checked in the last 6 days.
create function public.ring_checks_due(max_count integer)
returns table (id uuid, ring_id integer, domain text, status public.validation_state, consecutive_down integer)
language sql
stable
set search_path = ''
as $$
    select p.id, p.ring_id, p.domain, p.validated_user_component, coalesce(s.consecutive_down, 0)
    from public.profile p
    left join public.ring_link_state s on s.profile_id = p.id
    where p.domain ~ '^https?://'
      and (s.last_checked_at is null
           or s.last_checked_at < now() - interval '6 days'
           or (s.consecutive_down between 1 and 6 and s.last_checked_at < now() - interval '20 hours'))
    order by coalesce(s.consecutive_down, 0) between 1 and 6 desc, s.last_checked_at nulls first, p.ring_id
    limit max_count;
$$;

revoke execute on function public.record_ring_check(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.record_ring_check(uuid, text, integer, integer) to service_role;
revoke execute on function public.ring_checks_due(integer) from public, anon, authenticated;
grant execute on function public.ring_checks_due(integer) to service_role;
revoke execute on function public.record_widget_click(integer, text) from public, anon, authenticated;
grant execute on function public.record_widget_click(integer, text) to service_role;
