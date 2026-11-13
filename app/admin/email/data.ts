import "server-only";
import { loadMembers, recipientsFor } from "@/lib/email/campaigns";
import { EVERYONE } from "@/lib/email/audience";
import { createAdminClient } from "@/lib/supabase/server";
import type { ComposerMember } from "./types";

/** Every member as the composer sees them (no email addresses). */
export async function loadComposerMembers(): Promise<ComposerMember[]> {
    const members = await loadMembers(createAdminClient());
    const reachable = new Set(recipientsFor(members, EVERYONE).map((member) => member.id));
    return members.map((member) => ({
        ...member.audience,
        recipient: member.recipient,
        reachable: reachable.has(member.id),
        unsubscribed: member.unsubscribed,
    }));
}
