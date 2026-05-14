-- Ring visit stats and the "open to co-op / internships" flag.

-- 1. Daily hop counts per member, written by /redirect (service role only).
create table public.ring_visit_daily (
    ring_id integer not null references public.profile (ring_id) on delete cascade,
    day date not null,
    -- visitors the ring sent to this member's site
    inbound integer not null default 0,
    -- visitors who left this member's site through their widget
    outbound integer not null default 0,
    primary key (ring_id, day)
);
comment on table public.ring_visit_daily is 'Ring hops per member per day (UTC), recorded by /redirect';

alter table public.ring_visit_daily enable row level security;
revoke all on table public.ring_visit_daily from anon, authenticated;

-- One round-trip per hop, and the increments are atomic under concurrent visits.
create function public.record_ring_hop(from_ring_id integer, to_ring_id integer)
returns void
language plpgsql
set search_path = ''
as $$
begin
    if from_ring_id is not null then
        insert into public.ring_visit_daily as v (ring_id, day, outbound)
        values (from_ring_id, (now() at time zone 'utc')::date, 1)
        on conflict (ring_id, day) do update set outbound = v.outbound + 1;
    end if;

    insert into public.ring_visit_daily as v (ring_id, day, inbound)
    values (to_ring_id, (now() at time zone 'utc')::date, 1)
    on conflict (ring_id, day) do update set inbound = v.inbound + 1;
end;
$$;

revoke execute on function public.record_ring_hop(integer, integer) from public, anon, authenticated;
grant execute on function public.record_ring_hop(integer, integer) to service_role;

-- 2. Members can flag that they're looking for co-op / internship roles.
alter table public.profile add column open_to_work boolean not null default false;
grant update (open_to_work) on table public.profile to authenticated;
