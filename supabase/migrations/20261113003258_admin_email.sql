-- Admin email: campaigns written in /admin/email, one delivery row per recipient, and members' opt-outs.
-- All three tables are server-only (service role): RLS on with no policies, and no grants to clients.

create table public.email_campaign (
    id uuid primary key default gen_random_uuid(),
    subject text not null check (length(btrim(subject)) between 1 and 200),
    -- Plain text with light formatting and {{merge_fields}}, rendered by lib/email/format.ts
    body text not null check (length(btrim(body)) between 1 and 20000),
    -- Who it goes to, shape checked by audienceSchema in lib/email/audience.ts
    audience jsonb not null default '{}'::jsonb check (jsonb_typeof(audience) = 'object'),
    -- draft: editable. sending: recipients are fixed, deliveries are going out. sent: nothing left queued.
    status text not null default 'draft' check (status in ('draft', 'sending', 'sent')),
    created_by text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    sent_by text,
    -- When sending started (the recipient list was fixed)
    started_at timestamptz,
    finished_at timestamptz
);
comment on table public.email_campaign is 'Emails admins send to members from /admin/email';

create table public.email_delivery (
    id bigint generated always as identity primary key,
    campaign_id uuid not null references public.email_campaign (id) on delete cascade,
    profile_id uuid not null references public.profile (id) on delete cascade,
    -- The address at the time the recipient list was fixed
    email text not null,
    -- queued: waiting. sending: claimed by a batch. sent: accepted by the provider.
    -- failed: not delivered, may clear (throttling, credentials), can be retried.
    -- rejected: not delivered and never will be (bad address). unknown: timed out mid-send, may have
    -- been delivered, so never retried automatically. skipped: unsubscribed before their turn came.
    status text not null default 'queued'
        check (status in ('queued', 'sending', 'sent', 'failed', 'rejected', 'unknown', 'skipped')),
    error text,
    provider_message_id text,
    attempted_at timestamptz,
    sent_at timestamptz,
    unique (campaign_id, profile_id)
);
create index email_delivery_campaign_status on public.email_delivery (campaign_id, status);
comment on table public.email_delivery is 'One row per recipient of an email_campaign';

create table public.email_preference (
    profile_id uuid primary key references public.profile (id) on delete cascade,
    -- null: subscribed (the default for every member). Set by the unsubscribe link in every email.
    unsubscribed_at timestamptz,
    updated_at timestamptz not null default now()
);
comment on table public.email_preference is 'Members who opted out of admin emails';

alter table public.email_campaign enable row level security;
alter table public.email_delivery enable row level security;
alter table public.email_preference enable row level security;
revoke all on table public.email_campaign from anon, authenticated;
revoke all on table public.email_delivery from anon, authenticated;
revoke all on table public.email_preference from anon, authenticated;

-- Claims up to batch_size queued deliveries for one sending batch. `for update skip locked` lets two
-- batches (two admin tabs) run at once without ever claiming the same row, so nobody gets an email twice.
-- Members who unsubscribed after the list was fixed are marked skipped instead of claimed.
create function public.claim_email_deliveries(campaign uuid, batch_size integer)
returns table (id bigint, profile_id uuid, email text)
language plpgsql
set search_path = ''
as $$
begin
    update public.email_delivery d
    set status = 'skipped', attempted_at = now()
    from public.email_preference p
    where d.campaign_id = campaign
      and d.status = 'queued'
      and p.profile_id = d.profile_id
      and p.unsubscribed_at is not null;

    return query
    with picked as (
        select d.id
        from public.email_delivery d
        where d.campaign_id = campaign and d.status = 'queued'
        order by d.id
        limit batch_size
        for update skip locked
    )
    update public.email_delivery d
    set status = 'sending', attempted_at = now()
    from picked
    where d.id = picked.id
    returning d.id, d.profile_id, d.email;
end;
$$;

revoke execute on function public.claim_email_deliveries(uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_email_deliveries(uuid, integer) to service_role;
