import { NextResponse, type NextRequest } from "next/server";
import { cachedSitePreview } from "@/lib/previews";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { ringMembers } from "@/lib/profiles/ring";
import { previewVersion } from "@/lib/site";

// Previews are expensive to build: the CDN refreshes them daily in the background, so a new
// og:image shows within a day without a visitor ever waiting on a rebuild
const FOUND_CACHE = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";
// A missing preview may be a one-off fetch failure; check again within the hour
const MISSING_CACHE = "public, max-age=3600, s-maxage=3600";

function notFound(): NextResponse {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": MISSING_CACHE } });
}

/**
 * Preview thumbnail for a ring member's site. Only members' own domains can be fetched, and only the
 * canonical URL (`/api/preview/<ringId>?v=<previewVersion>`) is served, so varying the URL can't
 * bypass the CDN to make us refetch.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/preview/[ringId]">): Promise<NextResponse> {
    const raw = (await params).ringId;
    const search = request.nextUrl.searchParams;
    if (!/^(0|[1-9]\d{0,8})$/.test(raw) || search.size !== 1) return notFound();

    const ringId = Number(raw);
    const { data: profiles } = await getPublicProfiles();
    const member = profiles && ringMembers(profiles).find((profile) => profile.ringId === ringId);
    if (!member || search.get("v") !== previewVersion(member.domain)) return notFound();

    const preview = await cachedSitePreview(member.domain);
    if (!preview) return notFound();
    return new NextResponse(new Uint8Array(Buffer.from(preview, "base64")), {
        headers: { "Content-Type": "image/webp", "Cache-Control": FOUND_CACHE, "X-Content-Type-Options": "nosniff" },
    });
}
