"use server";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(2, "20 m"), // 2 requests per 20 minutes
    analytics: true,
});

const ms_to_seconds = 1 / 1000;

// Query rate limit server side from redis cache
export async function queryRateLimit(email: string) {
    const { success, reset } = await ratelimit.limit(email);

    // Rate limit resend
    if (!success) {
        const timeToTryAgain = (reset - Date.now()) * ms_to_seconds; // time to try again in seconds
        const minutes = Math.floor(timeToTryAgain / 60);
        const seconds = Math.floor(timeToTryAgain - minutes * 60);

        return {
            error: {
                message: `Resend rate limit reached, try again in ${minutes.toString()}:${seconds
                    .toString()
                    .padStart(2, "0")}`,
            },
        };
    }

    return {};
}
