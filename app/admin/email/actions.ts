"use server";

import { z } from "zod";
import { isAdminEmail } from "@/lib/admin";
import { getOwnProfile } from "@/lib/auth";
import { audienceSchema } from "@/lib/email/audience";
import {
    createDraft,
    deleteDraft,
    loadMembers,
    retryFailed,
    sendNextBatch,
    sendTest,
    startSending,
    updateDraft,
    type BatchProgress,
} from "@/lib/email/campaigns";
import { MAX_BODY_LENGTH, MAX_SUBJECT_LENGTH, unknownMergeFields } from "@/lib/email/format";
import { emailConfig } from "@/lib/email/transport";
import type { OwnProfile } from "@/lib/profiles/types";
import { fail, ok, type Result } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/server";

const contentSchema = z
    .object({
        subject: z.string().trim().min(1, "Add a subject.").max(MAX_SUBJECT_LENGTH, "The subject is too long."),
        body: z.string().trim().min(1, "Write the email first.").max(MAX_BODY_LENGTH, "The email is too long."),
    })
    .superRefine((value, context) => {
        const unknown = unknownMergeFields(`${value.subject}\n${value.body}`);
        if (unknown.length > 0)
            context.addIssue({ code: "custom", message: `Unknown merge field: ${unknown.map((name) => `{{${name}}}`).join(", ")}` });
    });

const draftSchema = contentSchema.and(z.object({ id: z.uuid().nullable(), audience: audienceSchema }));
const idSchema = z.object({ id: z.uuid() });

async function currentAdmin(): Promise<OwnProfile | null> {
    const viewer = await getOwnProfile();
    return viewer && isAdminEmail(viewer.email) ? viewer : null;
}

function firstIssue(error: z.ZodError): string {
    return error.issues[0]?.message ?? "Invalid request.";
}

/** Creates or updates a draft. Returns its id. */
export async function saveDraft(input: unknown): Promise<Result<{ id: string }>> {
    const admin = await currentAdmin();
    if (!admin) return fail("Not allowed.");
    const parsed = draftSchema.safeParse(input);
    if (!parsed.success) return fail(firstIssue(parsed.error));
    const { id, ...draft } = parsed.data;
    try {
        const db = createAdminClient();
        if (id === null) return ok({ id: await createDraft(db, draft, admin.email) });
        if (!(await updateDraft(db, id, draft))) return fail("This email has already been sent, so it can't be edited.");
        return ok({ id });
    } catch (error) {
        console.error("[admin email] Save failed:", error);
        return fail("Could not save the draft. Please try again.");
    }
}

export async function deleteDraftAction(input: unknown): Promise<Result<null>> {
    const admin = await currentAdmin();
    if (!admin) return fail("Not allowed.");
    const parsed = idSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid request.");
    try {
        if (!(await deleteDraft(createAdminClient(), parsed.data.id))) return fail("Only drafts can be deleted.");
        return ok(null);
    } catch (error) {
        console.error("[admin email] Delete failed:", error);
        return fail("Could not delete the draft. Please try again.");
    }
}

/** Sends the email, as the admin's own member record would get it, to the admin. */
export async function sendTestEmail(input: unknown): Promise<Result<{ to: string }>> {
    const admin = await currentAdmin();
    if (!admin) return fail("Not allowed.");
    const parsed = contentSchema.safeParse(input);
    if (!parsed.success) return fail(firstIssue(parsed.error));
    const { config, problem } = emailConfig();
    if (!config) return fail(problem);
    try {
        const [member] = await loadMembers(createAdminClient(), [admin.id]);
        if (!member) return fail("Could not load your member profile.");
        const result = await sendTest(config, parsed.data, member, admin.email);
        if (result.outcome !== "sent") {
            console.error("[admin email] Test send failed:", result.error);
            return fail(`The test didn't send (${result.outcome}). Check the email settings and try again.`);
        }
        return ok({ to: admin.email });
    } catch (error) {
        console.error("[admin email] Test send failed:", error);
        return fail("Could not send the test. Please try again.");
    }
}

/** Fixes the recipient list. The composer then calls sendBatch until it's done. */
export async function startSendingAction(input: unknown): Promise<Result<{ recipients: number }>> {
    const admin = await currentAdmin();
    if (!admin) return fail("Not allowed.");
    const parsed = idSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid request.");
    if (!emailConfig().config) return fail(emailConfig().problem ?? "Sending is off.");
    try {
        const result = await startSending(createAdminClient(), parsed.data.id, admin.email);
        return result.ok ? ok({ recipients: result.recipients }) : fail(result.reason);
    } catch (error) {
        console.error("[admin email] Start failed:", error);
        return fail("Could not start sending. Please try again.");
    }
}

export async function sendBatch(input: unknown): Promise<Result<BatchProgress>> {
    const admin = await currentAdmin();
    if (!admin) return fail("Not allowed.");
    const parsed = idSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid request.");
    const { config, problem } = emailConfig();
    if (!config) return fail(problem);
    try {
        return ok(await sendNextBatch(createAdminClient(), parsed.data.id, config));
    } catch (error) {
        console.error("[admin email] Batch failed:", error);
        return fail("Sending paused after an error. Resume to keep going.");
    }
}

export async function retryFailedAction(input: unknown): Promise<Result<{ queued: number }>> {
    const admin = await currentAdmin();
    if (!admin) return fail("Not allowed.");
    const parsed = idSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid request.");
    try {
        return ok({ queued: await retryFailed(createAdminClient(), parsed.data.id) });
    } catch (error) {
        console.error("[admin email] Retry failed:", error);
        return fail("Could not queue the retries. Please try again.");
    }
}
