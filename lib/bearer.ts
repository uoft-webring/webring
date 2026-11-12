import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Constant-time check of an `Authorization: Bearer <secret>` header. */
export function isAuthorized(header: string | null, secret: string): boolean {
    const expected = Buffer.from(`Bearer ${secret}`);
    const actual = Buffer.from(header ?? "");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}
