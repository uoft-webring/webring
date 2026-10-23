import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorized } from "@/lib/bearer";
import { serverEnv } from "@/lib/env";
import { PROFILES_TAG } from "@/lib/profiles/queries";
import type { Result } from "@/lib/result";

/** Called by the Supabase database webhook when profiles change outside the app (e.g. manual edits). */
export async function POST(request: NextRequest): Promise<NextResponse<Result<{ revalidated: true }>>> {
    const secret = serverEnv().REVALIDATION_SECRET_TOKEN;
    if (!secret) {
        console.error("[revalidate] REVALIDATION_SECRET_TOKEN is not set.");
        return NextResponse.json({ data: null, error: "Server configuration error." }, { status: 500 });
    }
    if (!isAuthorized(request.headers.get("authorization"), secret)) {
        return NextResponse.json({ data: null, error: "Unauthorized." }, { status: 401 });
    }

    // Expire immediately: the change already happened, nobody should keep seeing the old data
    revalidateTag(PROFILES_TAG, { expire: 0 });
    return NextResponse.json({ data: { revalidated: true }, error: null });
}
