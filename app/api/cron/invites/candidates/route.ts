import { NextResponse, type NextRequest } from "next/server";
import { cronAuthError } from "@/lib/cron";
import { inviteCandidateSchema, inviteCandidatesSchema, siteKey, type InviteCandidate } from "@/lib/invites";
import { fail, ok, type Result } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/server";

type ImportRun = { received: number; valid: number; alreadyMembers: number; added: number };

/** Called by .github/workflows/invites.yml with users found on GitHub; adds new ones as pending. */
export async function POST(request: NextRequest): Promise<NextResponse<Result<ImportRun>>> {
    const authError = cronAuthError(request);
    if (authError) return authError;

    const body = inviteCandidatesSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return NextResponse.json(fail("Expected an array of candidates."), { status: 400 });
    // Drop malformed entries individually rather than rejecting the whole batch
    const candidates = body.data.flatMap((raw) => {
        const parsed = inviteCandidateSchema.safeParse(raw);
        return parsed.success ? [parsed.data] : [];
    });

    const admin = createAdminClient();
    const { data: members, error: membersError } = await admin.from("profile").select("email, domain, github_url");
    if (membersError) {
        console.error("[invites] Failed to load members:", membersError.message);
        return NextResponse.json(fail("Could not load members."), { status: 500 });
    }
    const memberEmails = new Set(members.map((member) => String(member.email ?? "").toLowerCase()));
    const memberSites = new Set(members.flatMap((member) => siteKey(String(member.domain ?? "")) ?? []));
    // Legacy rows can carry stray whitespace (the column check is NOT VALID)
    const memberLogins = new Set(members.map((member) => String(member.github_url ?? "").trim().toLowerCase()));
    const isMember = (candidate: InviteCandidate) =>
        memberEmails.has(candidate.email) ||
        memberSites.has(siteKey(candidate.website) ?? "") ||
        memberLogins.has(candidate.githubLogin.toLowerCase());
    const fresh = candidates.filter((candidate) => !isMember(candidate));

    const { data: added, error } = await admin.rpc("add_invite_candidates", {
        candidates: fresh.map((candidate) => ({
            github_login: candidate.githubLogin,
            name: candidate.name,
            email: candidate.email,
            website: candidate.website,
            bio: candidate.bio,
        })),
    });
    if (error) {
        console.error("[invites] Failed to save candidates:", error.message);
        return NextResponse.json(fail("Could not save candidates."), { status: 500 });
    }

    return NextResponse.json(
        ok({
            received: body.data.length,
            valid: candidates.length,
            alreadyMembers: candidates.length - fresh.length,
            added: Number(added),
        })
    );
}
