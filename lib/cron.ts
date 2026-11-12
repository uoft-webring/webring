import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorized } from "@/lib/bearer";
import { serverEnv } from "@/lib/env";
import { fail, type Result } from "@/lib/result";

/** Routes called by GitHub Actions with `CRON_SECRET`. Returns the error response, or null if allowed. */
export function cronAuthError(request: NextRequest): NextResponse<Result<never>> | null {
    const secret = serverEnv().CRON_SECRET;
    if (!secret) {
        console.error("[cron] CRON_SECRET is not set.");
        return NextResponse.json(fail("Server configuration error."), { status: 500 });
    }
    if (!isAuthorized(request.headers.get("authorization"), secret)) {
        return NextResponse.json(fail("Unauthorized."), { status: 401 });
    }
    return null;
}
