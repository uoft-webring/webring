import { createClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it, vi } from "vitest";
import { audienceSchema } from "@/lib/email/audience";
import { createDraft, getCampaign, listDeliveries, loadMembers, recipientsFor, sendNextBatch, startSending } from "@/lib/email/campaigns";
import type { EmailConfig, OutgoingEmail } from "@/lib/email/transport";
import { dbTestsEnabled } from "./client";

vi.mock("@/lib/supabase/server", () => ({ createAdminClient: () => ({}) }));

// Writes to the LOCAL database only (a campaign it deletes afterwards). Runs the real engine against
// real members with a fake transport, checking the whole draft → sending → sent path.
const local = /^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");

describe.skipIf(!dbTestsEnabled() || !local)("email campaign engine (local DB)", () => {
    // Built lazily: describe bodies run at collection time even when skipped
    const client = () =>
        createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
    const created: string[] = [];

    afterAll(async () => {
        if (created.length > 0) await client().from("email_campaign").delete().in("id", created);
    });

    it("queues matching members once, sends each one email, and finishes", async () => {
        const db = client();
        const members = recipientsFor(await loadMembers(db), audienceSchema.parse({}));
        expect(members.length).toBeGreaterThan(1);
        const picked = members.slice(0, 3).map((member) => member.audience.ringId);

        const id = await createDraft(db, { subject: "Test {{first_name}}", body: "Hi {{name}}", audience: audienceSchema.parse({ ringIds: picked }) }, "test@example.com");
        created.push(id);

        const sent: OutgoingEmail[] = [];
        const config: EmailConfig = {
            provider: "mailpit",
            from: "Test <test@example.com>",
            transport: async (email) => {
                sent.push(email);
                return { outcome: "sent", messageId: `m${sent.length}` };
            },
        };

        const started = await startSending(db, id, "test@example.com");
        expect(started).toEqual({ ok: true, recipients: picked.length });
        // A second Send press can't queue the list again
        expect((await startSending(db, id, "test@example.com")).ok).toBe(false);

        let progress = await sendNextBatch(db, id, config, 2);
        while (!progress.done) progress = await sendNextBatch(db, id, config, 2);

        expect(sent).toHaveLength(picked.length);
        expect(new Set(sent.map((email) => email.to)).size).toBe(picked.length);
        expect(sent.every((email) => email.oneClickUnsubscribeUrl.includes("/api/email/unsubscribe?m="))).toBe(true);
        expect(progress.counts.sent).toBe(picked.length);
        expect((await getCampaign(db, id))?.status).toBe("sent");
        expect((await listDeliveries(db, id)).every((delivery) => delivery.status === "sent")).toBe(true);
    });
});
