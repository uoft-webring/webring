-- Fixed-window auth rate-limit counters, keyed by hashed bucket (service role only)
create table public.auth_rate_limit (
    bucket text not null,
    window_start timestamptz not null,
    hits integer not null default 1,
    primary key (bucket, window_start)
);

create index auth_rate_limit_window_start_idx on public.auth_rate_limit (window_start);

alter table public.auth_rate_limit enable row level security;
revoke all on table public.auth_rate_limit from anon, authenticated;

-- Counts one hit and returns whether the caller is still within `max_hits` for the current window.
-- One round-trip, and the increment is atomic under concurrent requests.
create function public.consume_rate_limit(bucket text, max_hits integer, window_seconds integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
    current_window timestamptz := to_timestamp(floor(extract(epoch from now()) / window_seconds) * window_seconds);
    total integer;
begin
    -- Windows are at most a day long, so older rows can never matter again; this keeps the table tiny.
    delete from public.auth_rate_limit where window_start < now() - interval '1 day';

    insert into public.auth_rate_limit as r (bucket, window_start)
    values (consume_rate_limit.bucket, current_window)
    -- Name the constraint: a bare `bucket` would be ambiguous with the parameter
    on conflict on constraint auth_rate_limit_pkey do update set hits = r.hits + 1
    returning r.hits into total;

    return total <= max_hits;
end;
$$;

revoke execute on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
