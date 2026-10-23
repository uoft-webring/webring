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

/** `?mode=send` emails people; anything else is a dry run, so a typo can't send. */
export function cronMode(request: NextRequest): "dry-run" | "send" {
    return request.nextUrl.searchParams.get("mode") === "send" ? "send" : "dry-run";
}

/**
 * Local and preview deployments can hold real people's data and AWS keys: only production emails.
 * Returns the refusal response, or null if this run may send.
 */
export function sendRefusal(mode: "dry-run" | "send"): NextResponse<Result<never>> | null {
    if (mode === "send" && serverEnv().VERCEL_ENV !== "production") {
        return NextResponse.json(fail("Sending only runs on the production deployment."), { status: 403 });
    }
    return null;
}

// SES starts accounts at 1 email a second
export function pauseBetweenSends(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1100));
}
