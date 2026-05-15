import { NextResponse, type NextRequest } from "next/server";
import { renderSitePreview } from "@/lib/previews";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { ringMembers } from "@/lib/profiles/ring";

// Previews change rarely and are expensive to build: let the CDN keep them for a week
const FOUND_CACHE = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800";
// Sites without a preview may add one later; check again in a few hours
const MISSING_CACHE = "public, max-age=3600, s-maxage=21600";

/** Preview thumbnail for a ring member's site. Only members' own domains can be fetched. */
export async function GET(_request: NextRequest, { params }: RouteContext<"/api/preview/[ringId]">): Promise<NextResponse> {
    const ringId = Number.parseInt((await params).ringId, 10);
    const { data: profiles } = await getPublicProfiles();
    const member = profiles && ringMembers(profiles).find((profile) => profile.ringId === ringId);

    const preview = member ? await renderSitePreview(member.domain) : null;
    if (!preview) {
        return new NextResponse(null, { status: 404, headers: { "Cache-Control": MISSING_CACHE } });
    }
    return new NextResponse(new Uint8Array(preview), {
        headers: { "Content-Type": "image/webp", "Cache-Control": FOUND_CACHE, "X-Content-Type-Options": "nosniff" },
    });
}
