import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSiteDown } from "@/lib/profiles/ring";
import type { RingStatus } from "@/lib/profiles/types";
import { audienceSchema, matchesAudience, type Audience, type AudienceMember } from "./audience";
import { renderEmail, type EmailContent, type EmailRecipient } from "./format";
import type { EmailConfig, SendResult } from "./transport";
import { unsubscribeUrls } from "./unsubscribe";

// The sending engine behind /admin/email. Every function takes the service-role client, so tests run
// the real thing against the local database with a fake transport.

export type CampaignStatus = "draft" | "sending" | "sent";
export type DeliveryStatus = "queued" | "sending" | "sent" | "failed" | "rejected" | "unknown" | "skipped";
export const DELIVERY_STATUSES: DeliveryStatus[] = ["queued", "sending", "sent", "failed", "rejected", "unknown", "skipped"];

export type Campaign = {
    id: string;
    subject: string;
    body: string;
    audience: Audience;
    status: CampaignStatus;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    sentBy: string | null;
    startedAt: string | null;
    finishedAt: string | null;
};

type CampaignRow = {
    id: string;
    subject: string;
    body: string;
    audience: unknown;
    status: CampaignStatus;
    created_by: string;
    created_at: string;
    updated_at: string;
    sent_by: string | null;
    started_at: string | null;
    finished_at: string | null;
};

const CAMPAIGN_COLUMNS = "id, subject, body, audience, status, created_by, created_at, updated_at, sent_by, started_at, finished_at";

function toCampaign(row: CampaignRow): Campaign {
    // A stored audience that no longer parses (schema changed) falls back to the defaults it can read
    const audience = audienceSchema.safeParse(row.audience);
    return {
        id: row.id,
        subject: row.subject,
        body: row.body,
        audience: audience.success ? audience.data : audienceSchema.parse({}),
        status: row.status,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        sentBy: row.sent_by,
        startedAt: row.started_at,
        finishedAt: row.finished_at,
    };
}

// ---------------------------------------------------------------- members

export type Member = {
    id: string;
    email: string;
    recipient: EmailRecipient;
    audience: AudienceMember;
    unsubscribed: boolean;
};

type MemberRow = {
    id: string;
    email: string | null;
    name: string | null;
    ring_id: number;
    slug: string | null;
    domain: string | null;
    validated_user_component: RingStatus | null;
    graduation_year: number | null;
    open_to_work: boolean;
    ring_link_state: { consecutive_down: number } | null;
    email_preference: { unsubscribed_at: string | null } | null;
};

const MEMBER_COLUMNS =
    "id, email, name, ring_id, slug, domain, validated_user_component, graduation_year, open_to_work, ring_link_state(consecutive_down), email_preference(unsubscribed_at)";

function toMember(row: MemberRow): Member {
    const domain = row.domain ?? "";
    return {
        id: row.id,
        email: (row.email ?? "").trim(),
        recipient: { name: row.name ?? "", ringId: row.ring_id, slug: row.slug ?? "", domain },
        audience: {
            ringId: row.ring_id,
            ringStatus: row.validated_user_component ?? "disconnected",
            domain,
            siteDown: isSiteDown(row.ring_link_state?.consecutive_down ?? 0),
            graduationYear: row.graduation_year,
            openToWork: row.open_to_work,
        },
        unsubscribed: Boolean(row.email_preference?.unsubscribed_at),
    };
}

/** Every member, with what the audience filters and merge fields need. Ordered by ring id. */
export async function loadMembers(db: SupabaseClient, profileIds?: string[]): Promise<Member[]> {
    let query = db.from("profile").select(MEMBER_COLUMNS).order("ring_id");
    if (profileIds) query = query.in("id", profileIds);
    const { data, error } = await query.returns<MemberRow[]>();
    if (error) throw new Error(error.message);
    return data.map(toMember);
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Who an audience reaches right now: matching, subscribed, with a usable address. */
export function recipientsFor(members: Member[], audience: Audience): Member[] {
    return members.filter((member) => !member.unsubscribed && EMAIL_SHAPE.test(member.email) && matchesAudience(member.audience, audience));
}

// ---------------------------------------------------------------- campaigns

export type DeliveryCounts = Record<DeliveryStatus, number> & { total: number };

function emptyCounts(): DeliveryCounts {
    return { queued: 0, sending: 0, sent: 0, failed: 0, rejected: 0, unknown: 0, skipped: 0, total: 0 };
}

export type CampaignSummary = Campaign & { counts: DeliveryCounts };

export async function listCampaigns(db: SupabaseClient): Promise<CampaignSummary[]> {
    const { data, error } = await db
        .from("email_campaign")
        .select(CAMPAIGN_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(200)
        .returns<CampaignRow[]>();
    if (error) throw new Error(error.message);
    const counts = await countDeliveries(db, data.map((row) => row.id));
    return data.map((row) => ({ ...toCampaign(row), counts: counts.get(row.id) ?? emptyCounts() }));
}

export async function getCampaign(db: SupabaseClient, id: string): Promise<CampaignSummary | null> {
    const { data, error } = await db.from("email_campaign").select(CAMPAIGN_COLUMNS).eq("id", id).maybeSingle<CampaignRow>();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const counts = await countDeliveries(db, [id]);
    return { ...toCampaign(data), counts: counts.get(id) ?? emptyCounts() };
}

async function countDeliveries(db: SupabaseClient, campaignIds: string[]): Promise<Map<string, DeliveryCounts>> {
    const counts = new Map<string, DeliveryCounts>();
    if (campaignIds.length === 0) return counts;
    // Paged: PostgREST caps a response at 1000 rows
    for (let from = 0; ; from += 1000) {
        const { data, error } = await db
            .from("email_delivery")
            .select("campaign_id, status")
            .in("campaign_id", campaignIds)
            .order("id")
            .range(from, from + 999)
            .returns<{ campaign_id: string; status: DeliveryStatus }[]>();
        if (error) throw new Error(error.message);
        for (const row of data) {
            const entry = counts.get(row.campaign_id) ?? emptyCounts();
            entry[row.status]++;
            entry.total++;
            counts.set(row.campaign_id, entry);
        }
        if (data.length < 1000) return counts;
    }
}

export type DeliveryRow = {
    id: number;
    email: string;
    status: DeliveryStatus;
    error: string | null;
    sentAt: string | null;
    name: string;
    ringId: number | null;
};

export async function listDeliveries(db: SupabaseClient, campaignId: string): Promise<DeliveryRow[]> {
    const { data, error } = await db
        .from("email_delivery")
        .select("id, email, status, error, sent_at, profile(name, ring_id)")
        .eq("campaign_id", campaignId)
        .order("id")
        .limit(2000)
        .returns<
            {
                id: number;
                email: string;
                status: DeliveryStatus;
                error: string | null;
                sent_at: string | null;
                profile: { name: string | null; ring_id: number } | null;
            }[]
        >();
    if (error) throw new Error(error.message);
    return data.map((row) => ({
        id: row.id,
        email: row.email,
        status: row.status,
        error: row.error,
        sentAt: row.sent_at,
        name: row.profile?.name ?? "",
        ringId: row.profile?.ring_id ?? null,
    }));
}

export type DraftInput = EmailContent & { audience: Audience };

export async function createDraft(db: SupabaseClient, input: DraftInput, adminEmail: string): Promise<string> {
    const { data, error } = await db
        .from("email_campaign")
        .insert({ subject: input.subject, body: input.body, audience: input.audience, created_by: adminEmail })
        .select("id")
        .single<{ id: string }>();
    if (error) throw new Error(error.message);
    return data.id;
}

/** False when the campaign isn't a draft any more (someone started sending it). */
export async function updateDraft(db: SupabaseClient, id: string, input: DraftInput): Promise<boolean> {
    const { data, error } = await db
        .from("email_campaign")
        .update({ subject: input.subject, body: input.body, audience: input.audience, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("status", "draft")
        .select("id");
    if (error) throw new Error(error.message);
    return data.length > 0;
}

export async function deleteDraft(db: SupabaseClient, id: string): Promise<boolean> {
    const { data, error } = await db.from("email_campaign").delete().eq("id", id).eq("status", "draft").select("id");
    if (error) throw new Error(error.message);
    return data.length > 0;
}

// ---------------------------------------------------------------- sending

export type StartResult = { ok: true; recipients: number } | { ok: false; reason: string };

/**
 * Fixes the recipient list and moves the draft to `sending`. Only one caller can win the draft → sending
 * step, so two admins pressing Send at once queue the list once.
 */
export async function startSending(db: SupabaseClient, id: string, adminEmail: string): Promise<StartResult> {
    const campaign = await getCampaign(db, id);
    if (!campaign) return { ok: false, reason: "That email doesn't exist any more." };
    if (campaign.status !== "draft") return { ok: false, reason: "That email is already sending or sent." };

    const recipients = recipientsFor(await loadMembers(db), campaign.audience);
    if (recipients.length === 0) return { ok: false, reason: "Nobody matches this audience." };

    const now = new Date().toISOString();
    const { data: claimed, error: claimError } = await db
        .from("email_campaign")
        .update({ status: "sending", sent_by: adminEmail, started_at: now, updated_at: now })
        .eq("id", id)
        .eq("status", "draft")
        .select("id");
    if (claimError) throw new Error(claimError.message);
    if (claimed.length === 0) return { ok: false, reason: "That email is already sending or sent." };

    // One insert: all recipients are queued or none are
    const { error } = await db
        .from("email_delivery")
        .upsert(
            recipients.map((member) => ({ campaign_id: id, profile_id: member.id, email: member.email })),
            { onConflict: "campaign_id,profile_id", ignoreDuplicates: true }
        );
    if (error) {
        await db.from("email_campaign").update({ status: "draft", sent_by: null, started_at: null }).eq("id", id);
        throw new Error(error.message);
    }
    return { ok: true, recipients: recipients.length };
}

export type BatchProgress = { counts: DeliveryCounts; done: boolean };

export const BATCH_SIZE = 25;
const CONCURRENCY = 4;
// Under SES's default production rate (14/s), leaving room for other sends
const MAX_PER_SECOND = 10;
// A delivery still `sending` this long after its batch claimed it was cut off mid-send (timeout, deploy)
const STALE_SENDING_MS = 3 * 60_000;

/** Runs `task` over `items`, `concurrency` at a time, starting at most `perSecond` per second. */
async function paced<T>(items: T[], concurrency: number, perSecond: number, task: (item: T) => Promise<void>): Promise<void> {
    let next = 0;
    let lastStart = 0;
    const gap = 1000 / perSecond;
    async function worker(): Promise<void> {
        while (next < items.length) {
            const item = items[next++];
            const wait = lastStart + gap - Date.now();
            lastStart = Math.max(Date.now(), lastStart + gap);
            if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
            await task(item);
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

const OUTCOME_STATUS: Record<SendResult["outcome"], DeliveryStatus> = {
    sent: "sent",
    failed: "failed",
    rejected: "rejected",
    unknown: "unknown",
};

/**
 * Sends the next batch of a `sending` campaign. The composer calls this until `done`, so each call
 * stays well inside the function time limit and closing the tab only pauses the campaign.
 */
export async function sendNextBatch(db: SupabaseClient, id: string, config: EmailConfig, batchSize = BATCH_SIZE): Promise<BatchProgress> {
    const campaign = await getCampaign(db, id);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "sending") return { counts: campaign.counts, done: true };

    // Rows a cut-off batch left behind may have gone out: never resend them on our own
    await db
        .from("email_delivery")
        .update({ status: "unknown", error: "Interrupted while sending; it may have been delivered." })
        .eq("campaign_id", id)
        .eq("status", "sending")
        .lt("attempted_at", new Date(Date.now() - STALE_SENDING_MS).toISOString());

    const { data, error } = await db.rpc("claim_email_deliveries", { campaign: id, batch_size: batchSize });
    if (error) throw new Error(error.message);
    const claimed = (data ?? []) as { id: number; profile_id: string; email: string }[];

    if (claimed.length > 0) {
        const members = new Map((await loadMembers(db, claimed.map((row) => row.profile_id))).map((member) => [member.id, member]));
        await paced(claimed, CONCURRENCY, MAX_PER_SECOND, async (delivery) => {
            const member = members.get(delivery.profile_id);
            const result: SendResult = member
                ? await sendTo(config, campaign, member.recipient, delivery.email, delivery.profile_id)
                : { outcome: "rejected", error: "Member no longer exists." };
            const { error: updateError } = await db
                .from("email_delivery")
                .update({
                    status: OUTCOME_STATUS[result.outcome],
                    error: result.outcome === "sent" ? null : result.error,
                    provider_message_id: result.outcome === "sent" ? result.messageId : null,
                    sent_at: result.outcome === "sent" ? new Date().toISOString() : null,
                })
                .eq("id", delivery.id);
            if (updateError) console.error("[email] Failed to record a delivery:", updateError.message);
        });
    }

    const counts = (await countDeliveries(db, [id])).get(id) ?? emptyCounts();
    const done = counts.queued === 0 && counts.sending === 0;
    if (done) {
        const now = new Date().toISOString();
        await db.from("email_campaign").update({ status: "sent", finished_at: now, updated_at: now }).eq("id", id).eq("status", "sending");
    }
    return { counts, done };
}

function sendTo(config: EmailConfig, content: EmailContent, recipient: EmailRecipient, to: string, profileId: string): Promise<SendResult> {
    const links = unsubscribeUrls(profileId);
    const rendered = renderEmail(content, recipient, { unsubscribeUrl: links.page, postalAddress: config.postalAddress });
    return config.transport({ to, ...rendered, oneClickUnsubscribeUrl: links.oneClick });
}

/** Queues `failed` deliveries again (throttling, credentials fixed) and reopens the campaign. */
export async function retryFailed(db: SupabaseClient, id: string): Promise<number> {
    const { data, error } = await db
        .from("email_delivery")
        .update({ status: "queued", error: null })
        .eq("campaign_id", id)
        .eq("status", "failed")
        .select("id");
    if (error) throw new Error(error.message);
    if (data.length > 0) {
        await db.from("email_campaign").update({ status: "sending", finished_at: null, updated_at: new Date().toISOString() }).eq("id", id).neq("status", "draft");
    }
    return data.length;
}

/** The email as `member` would get it, to the admin's own inbox, subject marked as a test. */
export function sendTest(config: EmailConfig, content: EmailContent, member: Member, to: string): Promise<SendResult> {
    return sendTo(config, { ...content, subject: `[Test] ${content.subject}` }, member.recipient, to, member.id);
}
