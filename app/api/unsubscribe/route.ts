import { NextResponse, type NextRequest } from "next/server";
import { fail, ok, type Result } from "@/lib/result";
import { isValidUnsubscribeToken, recordUnsubscribe, unsubscribeParamsSchema } from "@/lib/unsubscribe";

/** Some mail clients open the List-Unsubscribe URL in a browser instead of POSTing: show the confirm page. */
export async function GET(request: NextRequest): Promise<NextResponse> {
    return NextResponse.redirect(new URL(`/unsubscribe${request.nextUrl.search}`, request.url));
}

/** RFC 8058 one-click unsubscribe: mail clients POST here from the List-Unsubscribe header. */
export async function POST(request: NextRequest): Promise<NextResponse<Result<null>>> {
    const params = unsubscribeParamsSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!params.success || !isValidUnsubscribeToken(params.data.kind, params.data.id, params.data.token)) {
        return NextResponse.json(fail("Invalid unsubscribe link."), { status: 400 });
    }
    if (!(await recordUnsubscribe(params.data.kind, params.data.id))) {
        return NextResponse.json(fail("Could not unsubscribe. Please try again."), { status: 500 });
    }
    return NextResponse.json(ok(null));
}
