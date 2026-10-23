"use server";

import { updateTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { getAuthUser, getOwnProfile } from "@/lib/auth";
import {
    OWN_PROFILE_COLUMNS,
    toOwnProfile,
    toProfileUpdate,
    type OwnProfileRow,
} from "@/lib/profiles/mapper";
import { PAGE_CONTENT_COLUMNS, toPageContent, type PageContentRow } from "@/lib/profiles/page";
import { PROFILES_TAG } from "@/lib/profiles/queries";
import type { OwnProfile, RingStatus } from "@/lib/profiles/types";
import { fail, ok, type Result } from "@/lib/result";
import { AVATAR_UPLOAD_LIMIT, consumeRateLimit, SITE_CHECK_LIMIT } from "@/lib/rate-limit";
import { createAvatarUploadUrl, deleteAvatar, isOwnedAvatarKey, MAX_AVATAR_BYTES } from "@/lib/s3";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { pageContentSchema, profileInputSchema, type PageContent } from "@/lib/validation";
import { recordRingCheck } from "@/lib/profiles/ring-link-state";
import { ringCheckMessage, statusAfterCheck } from "@/lib/ring-link";
import {
    checkRingWidget,
    hasDomainOwnershipProof,
    isUrlReachable,
    type RingWidgetResult,
} from "@/lib/verification";

const UNIQUE_VIOLATION = "23505";
const TOO_MANY_SITE_CHECKS = "Too many checks. Please try again in an hour.";

/** The caller's profile as a Result, so actions report failures instead of throwing at the client. */
async function currentProfile(): Promise<Result<OwnProfile>> {
    try {
        const profile = await getOwnProfile();
        return profile ? ok(profile) : fail("Please sign in again.");
    } catch (error) {
        unstable_rethrow(error);
        console.error("[dashboard]", error);
        return fail("Something went wrong. Please try again.");
    }
}

export async function updateProfile(input: unknown): Promise<Result<OwnProfile>> {
    const parsed = profileInputSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const { data: current, error: profileError } = await currentProfile();
    if (profileError !== null) return fail(profileError);
    const next = parsed.data;

    // Members may keep their current image or switch to one they uploaded, never someone else's key
    if (
        next.imageKey !== current.imageKey &&
        next.imageKey !== "" &&
        !isOwnedAvatarKey(next.imageKey, current.id)
    ) {
        return fail("Invalid image.");
    }

    // Only probe the site when it changed: autosave runs on every keystroke pause
    if (next.domain && next.domain !== current.domain && !(await isUrlReachable(next.domain))) {
        return fail("Domain URL is not reachable. Please enter a live URL.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profile")
        .update(toProfileUpdate(next))
        .eq("id", current.id)
        .select(OWN_PROFILE_COLUMNS)
        .single<OwnProfileRow>();

    if (error) {
        if (error.code === UNIQUE_VIOLATION) return fail("Slug already taken");
        console.error("[profile] Update failed:", error.code, error.message);
        return fail("Could not save your profile.");
    }

    if (current.imageKey && current.imageKey !== next.imageKey) {
        await deleteAvatarIfUnused(current.imageKey);
    }

    updateTag(PROFILES_TAG);
    return ok(toOwnProfile(data));
}

/** Legacy keys aren't owner-prefixed, so make sure no other profile still points at the object. */
async function deleteAvatarIfUnused(imageKey: string): Promise<void> {
    const { count } = await createAdminClient()
        .from("profile")
        .select("id", { count: "exact", head: true })
        .eq("image_key", imageKey);
    if (count !== 0) return;

    try {
        await deleteAvatar(imageKey);
    } catch (error) {
        console.error("[profile] Failed to delete old avatar:", error);
    }
}

export async function createAvatarUpload(
    size: number
): Promise<Result<{ uploadUrl: string; imageKey: string }>> {
    const user = await getAuthUser();
    if (!user) return fail("Please sign in again.");
    if (!Number.isInteger(size) || size <= 0 || size > MAX_AVATAR_BYTES) {
        return fail("That image is too large. Try a smaller crop.");
    }
    if (!(await consumeRateLimit(AVATAR_UPLOAD_LIMIT, user.id))) {
        return fail("Too many uploads. Please try again in an hour.");
    }
    return ok(await createAvatarUploadUrl(user.id, size));
}

export async function verifyDomainOwnership(): Promise<Result<boolean>> {
    const { data: profile, error: profileError } = await currentProfile();
    if (profileError !== null) return fail(profileError);
    if (!profile.domain) return fail("Add your portfolio link before verifying.");
    if (profile.isVerified) return ok(true);
    // Each check fetches the member's site; don't let a stuck button hammer it
    if (!(await consumeRateLimit(SITE_CHECK_LIMIT, profile.id))) return fail(TOO_MANY_SITE_CHECKS);

    if (!(await hasDomainOwnershipProof(profile.domain, profile.ringId))) return ok(false);

    // Members can't write is_verified themselves (column grants), so the server records it.
    // Matching the checked domain stops a concurrent domain change from inheriting this result.
    const { data: updated, error } = await createAdminClient()
        .from("profile")
        .update({ is_verified: true })
        .eq("id", profile.id)
        .eq("domain", profile.domain)
        .select("id");
    if (error) {
        console.error("[verify] Failed to record verification:", error.message);
        return fail("Your record checks out, but we couldn't save that. Please try again.");
    }
    if (updated.length === 0)
        return fail("Your portfolio link changed while we were checking. Please try again.");

    updateTag(PROFILES_TAG);
    return ok(true);
}

export type RingLinkCheck = { status: RingStatus; result: RingWidgetResult; message: string };

export async function checkRingLink(): Promise<Result<RingLinkCheck>> {
    const { data: profile, error: profileError } = await currentProfile();
    if (profileError !== null) return fail(profileError);
    if (!profile.domain) return fail("Add your portfolio link before joining the ring.");
    if (profile.ringStatus === "connected") {
        return ok({ status: "connected", result: "found", message: "Your site is already linked." });
    }
    if (!(await consumeRateLimit(SITE_CHECK_LIMIT, profile.id))) return fail(TOO_MANY_SITE_CHECKS);

    const result = await checkRingWidget(profile.domain, profile.ringId);
    const status = statusAfterCheck(result, profile.ringStatus);
    await recordRingCheck(profile.id, result);

    if (status !== profile.ringStatus) {
        // Matching the checked domain stops a concurrent domain change from inheriting this result
        const { data: updated, error } = await createAdminClient()
            .from("profile")
            .update({ validated_user_component: status })
            .eq("id", profile.id)
            .eq("domain", profile.domain)
            .select("id");
        if (error) {
            console.error("[ring] Failed to record ring status:", error.message);
            return fail("Could not save your ring status. Please try again.");
        }
        if (updated.length === 0)
            return fail("Your portfolio link changed while we were checking. Please try again.");
        updateTag(PROFILES_TAG);
    }

    return ok({ status, result, message: ringCheckMessage(result, profile.ringId) });
}

/** Saves the member's own page (about, projects, experience, links, accent). */
export async function updatePageContent(input: unknown): Promise<Result<PageContent>> {
    const parsed = pageContentSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const { data: current, error: profileError } = await currentProfile();
    if (profileError !== null) return fail(profileError);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profile")
        .update(parsed.data)
        .eq("id", current.id)
        .select(PAGE_CONTENT_COLUMNS)
        .single<PageContentRow>();
    if (error) {
        console.error("[page] Update failed:", error.code, error.message);
        return fail("Could not save your page.");
    }

    updateTag(PROFILES_TAG);
    return ok(toPageContent(data));
}
