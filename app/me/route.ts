import { NextResponse, type NextRequest } from "next/server";
import { getViewerProfile } from "@/lib/auth";
import { profilePath } from "@/lib/site";

// Stable link to "my profile" for static UI (e.g. the footer) that can't know the viewer's slug.
export async function GET(request: NextRequest): Promise<NextResponse> {
    const profile = await getViewerProfile();
    const target = profile?.slug ? profilePath(profile.slug) : "/signin";
    return NextResponse.redirect(new URL(target, request.url));
}
