// Shared by rate limiting (server actions) and widget click verification (proxy).

/**
 * The client from the first hop of `x-forwarded-for` (Vercel sets it to the real address): an IPv4
 * address, or an IPv6 /64, since one user usually controls a whole /64.
 */
export function clientIpFrom(forwardedFor: string | null): string | null {
    const ip = forwardedFor?.split(",")[0]?.trim().toLowerCase();
    if (!ip) return null;
    if (!ip.includes(":")) return ip;
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return mapped[1];
    const [head, tail] = ip.split("::");
    const headParts = head ? head.split(":") : [];
    const tailParts = tail ? tail.split(":") : [];
    const groups = [...headParts, ...Array(Math.max(0, 8 - headParts.length - tailParts.length)).fill("0"), ...tailParts];
    return `${groups
        .slice(0, 4)
        .map((group) => group.replace(/^0+(?=.)/, ""))
        .join(":")}::/64`;
}
