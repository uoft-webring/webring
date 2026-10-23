"use server";

import { fail, ok, type Result } from "@/lib/result";
import { isValidUnsubscribeToken, recordUnsubscribe, unsubscribeParamsSchema } from "@/lib/unsubscribe";

export async function unsubscribe(_prev: Result<null> | null, formData: FormData): Promise<Result<null>> {
    const params = unsubscribeParamsSchema.safeParse(Object.fromEntries(formData));
    if (!params.success || !isValidUnsubscribeToken(params.data.kind, params.data.id, params.data.token)) {
        return fail("This unsubscribe link is invalid.");
    }
    return (await recordUnsubscribe(params.data.kind, params.data.id))
        ? ok(null)
        : fail("Could not unsubscribe. Please try again.");
}
