import "server-only";
import { createHmac } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { serverEnv } from "@/lib/env";
import { safeFetch } from "@/lib/url-safety";

/**
 * Two separate checks:
 * - Ring link (`validated_user_component`): the member's site embeds the prev/next widget.
 * - Domain verification (`is_verified`): the member controls DNS for the domain (TXT record).
 */

export const TXT_RECORD_NAME = "uoft-webring";

/** Deterministic per member, but only we can generate it, so it can't be spoofed. */
export function txtRecordValue(ringId: number): string {
    return createHmac("sha256", serverEnv().DOMAIN_VALIDATION_SECRET_KEY).update(String(ringId)).digest("base64url");
}

export async function hasVerificationRecord(domain: string, ringId: number): Promise<boolean> {
    let hostname: string;
    try {
        hostname = new URL(domain).hostname;
    } catch {
        return false;
    }

    try {
        const records = await resolveTxt(`${TXT_RECORD_NAME}.${hostname}`);
        return records.map((parts) => parts.join("")).includes(txtRecordValue(ringId));
    } catch {
        // ENOTFOUND / ENODATA: no record yet
        return false;
    }
}

export async function isUrlReachable(url: string): Promise<boolean> {
    // Real sites chain http→https→www→trailing slash→locale; main accepted any redirect, so allow plenty
    const response =
        (await safeFetch(url, { method: "HEAD", maxRedirects: 8 })) ??
        (await safeFetch(url, { method: "GET", maxRedirects: 8 }));
    return response !== null && response.status < 400;
}

const WIDGET_LINK = /uoftwebring\.com\/redirect\?([^"'\s<>`]*)/gi;

/** Whether `html` links to both the previous and next member from `ringId`. */
export function hasRingWidget(html: string, ringId: number): boolean {
    const found = new Set<string>();
    for (const match of html.matchAll(WIDGET_LINK)) {
        const params = new URLSearchParams(match[1].replaceAll("&amp;", "&"));
        const nav = params.get("nav");
        if ((nav === "prev" || nav === "next") && params.get("id") === String(ringId)) found.add(nav);
    }
    return found.has("prev") && found.has("next");
}

export type WidgetCheck = "found" | "missing" | "unreachable";

export async function checkRingWidget(domain: string, ringId: number): Promise<WidgetCheck> {
    // The widget belongs in the static HTML; scanning past the first 2MB isn't worth it
    const response = await safeFetch(domain, { method: "GET", timeoutMs: 8000, maxBytes: 2 * 1024 * 1024 });
    if (!response || !response.ok) return "unreachable";
    return hasRingWidget(response.body.toString("utf8"), ringId) ? "found" : "missing";
}
