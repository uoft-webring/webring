import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_PROFILE_COLUMNS, toPublicProfile, type PublicProfileRow } from "@/lib/profiles/mapper";
import { findRingDestination, ringMembers } from "@/lib/profiles/ring";
import type { PublicProfile } from "@/lib/profiles/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// /redirect is embedded on every member's site, so it's the hottest path. Keep the ring in
// instance memory for a minute instead of querying per click (Fluid Compute reuses instances).
const RING_TTL_MS = 60_000;
let ringCache: { members: PublicProfile[]; expires: number } | undefined;

function adminClient() {
    return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

async function loadRing(): Promise<PublicProfile[]> {
    if (ringCache && ringCache.expires > Date.now()) return ringCache.members;

    const { data, error } = await adminClient()
        .from("profile")
        .select(PUBLIC_PROFILE_COLUMNS)
        .order("ring_id", { ascending: true })
        .returns<PublicProfileRow[]>();

    if (error) {
        console.error("[redirect] Failed to load ring:", error.message);
        // Serve stale data rather than dropping visitors on the home page
        return ringCache?.members ?? [];
    }
    const members = ringMembers(data.map(toPublicProfile));
    ringCache = { members, expires: Date.now() + RING_TTL_MS };
    return members;
}

// Crawlers and link unfurlers follow widget links too; they'd swamp the members' stats
const NON_HUMAN_AGENT = /bot|crawl|spider|slurp|preview|fetch|monitor|curl|wget|python|headless|lighthouse/i;

function isCountableVisit(request: NextRequest): boolean {
    const agent = request.headers.get("user-agent") ?? "";
    const prefetch = request.headers.get("sec-purpose") ?? request.headers.get("purpose") ?? "";
    return agent !== "" && !NON_HUMAN_AGENT.test(agent) && !/prefetch|prerender/i.test(prefetch);
}

async function recordHop(fromRingId: number | null, toRingId: number): Promise<void> {
    const { error } = await adminClient().rpc("record_ring_hop", { from_ring_id: fromRingId, to_ring_id: toRingId });
    if (error) console.error("[redirect] Failed to record hop:", error.message);
}

// e.g. https://uoftwebring.com/redirect?nav=prev&id=0. Never change this URL shape: it's on members' sites.
async function handleRingRedirect(request: NextRequest, event: NextFetchEvent): Promise<NextResponse> {
    const home = new URL("/", request.url);
    const nav = request.nextUrl.searchParams.get("nav");
    const id = Number.parseInt(request.nextUrl.searchParams.get("id") ?? "", 10);
    if ((nav !== "next" && nav !== "prev") || Number.isNaN(id)) return NextResponse.redirect(home);

    const members = await loadRing();
    const destination = findRingDestination(members, id, nav);
    if (!destination) return NextResponse.redirect(home);

    if (isCountableVisit(request)) {
        const to = members.find((member) => member.domain === destination);
        // Only credit real members as the source, so made-up ids can't create stats rows
        const from = members.some((member) => member.ringId === id) ? id : null;
        // After the response: counting a visit must never slow the redirect down
        if (to) event.waitUntil(recordHop(from, to.ringId));
    }
    return NextResponse.redirect(new URL(destination));
}

/** Refreshes the Supabase session cookie so Server Components always see a valid session. */
async function refreshSession(request: NextRequest): Promise<NextResponse> {
    let response = NextResponse.next({ request });

    // Visitors who never signed in have no session to refresh: skip the auth round-trip
    if (!request.cookies.getAll().some(({ name }) => name.startsWith("sb-"))) return response;

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet, headers) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
            },
        },
    });
    await supabase.auth.getClaims();
    return response;
}

export async function proxy(request: NextRequest, event: NextFetchEvent): Promise<NextResponse> {
    if (request.nextUrl.pathname === "/redirect") return handleRingRedirect(request, event);
    return refreshSession(request);
}

export const config = {
    // Skip static assets, image optimisation, the PostHog relay and metadata files
    matcher: [
        "/((?!_next/static|_next/image|relay-OyIr|favicon.ico|manifest.webmanifest|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff2?)$).*)",
    ],
};
