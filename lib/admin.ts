import "server-only";
import { notFound } from "next/navigation";
import { getOwnProfile } from "@/lib/auth";
import { serverEnv } from "@/lib/env";
import type { OwnProfile } from "@/lib/profiles/types";

/** Whether the signed-in member may use the admin pages (ADMIN_EMAILS, comma-separated). */
export function isAdminEmail(email: string): boolean {
    const admins = (serverEnv().ADMIN_EMAILS ?? "").split(",").map((entry) => entry.trim().toLowerCase());
    return email !== "" && admins.includes(email.trim().toLowerCase());
}

/** The admin's profile, or a 404 so the page doesn't reveal it exists. */
export async function requireAdmin(): Promise<OwnProfile> {
    const profile = await getOwnProfile();
    if (!profile || !isAdminEmail(profile.email)) notFound();
    return profile;
}
