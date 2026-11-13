import { NextResponse, type NextRequest } from "next/server";
import { setEmailSubscription, verifyUnsubscribeParams } from "@/lib/email/unsubscribe";

function params(request: NextRequest): { m: string | null; t: string | null } {
    return { m: request.nextUrl.searchParams.get("m"), t: request.nextUrl.searchParams.get("t") };
}

/** One-click unsubscribe (RFC 8058): mail clients POST here from the List-Unsubscribe header. */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const profileId = verifyUnsubscribeParams(params(request));
    if (!profileId) return new NextResponse("Invalid link", { status: 400 });
    if (!(await setEmailSubscription(profileId, false))) return new NextResponse("Try again later", { status: 503 });
    return new NextResponse("Unsubscribed", { status: 200 });
}

/** Someone opened the header link in a browser: show the page with the button instead of acting on a GET. */
export function GET(request: NextRequest): NextResponse {
    const url = new URL("/unsubscribe", request.nextUrl.origin);
    const { m, t } = params(request);
    if (m) url.searchParams.set("m", m);
    if (t) url.searchParams.set("t", t);
    return NextResponse.redirect(url, 303);
}
