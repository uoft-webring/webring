import "server-only";
import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";

// Non-public ranges: loopback, private, link-local (cloud metadata), CGNAT, multicast, reserved, docs.
const blocked = new BlockList();
for (const [network, prefix] of [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.168.0.0", 16],
    ["198.18.0.0", 15],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4],
] as const) {
    blocked.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
    ["::", 128],
    ["::1", 128],
    ["64:ff9b::", 96],
    ["100::", 64],
    ["2001:db8::", 32],
    ["fc00::", 7],
    ["fe80::", 10],
    ["ff00::", 8],
] as const) {
    blocked.addSubnet(network, prefix, "ipv6");
}

export function isPublicAddress(address: string): boolean {
    const version = isIP(address);
    if (version === 4) return !blocked.check(address, "ipv4");
    if (version === 6) {
        // IPv4-mapped (::ffff:a.b.c.d) must be judged by the embedded IPv4 address
        const mapped = address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
        if (mapped) return isPublicAddress(mapped[1]);
        if (address.toLowerCase().startsWith("::ffff:")) return false;
        return !blocked.check(address, "ipv6");
    }
    return false;
}

/** Parses `raw` and confirms it is http(s) and every address it resolves to is public. */
export async function resolvePublicUrl(raw: string): Promise<URL | null> {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return null;
    }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;

    // WHATWG keeps brackets around IPv6 hostnames
    const host = url.hostname.replace(/^\[(.*)\]$/, "$1");
    if (isIP(host)) return isPublicAddress(host) ? url : null;

    try {
        const addresses = await lookup(host, { all: true, verbatim: true });
        return addresses.length > 0 && addresses.every(({ address }) => isPublicAddress(address)) ? url : null;
    } catch {
        return null;
    }
}

type SafeFetchOptions = {
    method?: "GET" | "HEAD";
    timeoutMs?: number;
    maxRedirects?: number;
    /** Body bytes to keep; the rest is discarded unread. */
    maxBytes?: number;
};

export type SafeResponse = { status: number; ok: boolean; body: string };

/**
 * DNS lookup for outgoing requests that refuses non-public addresses. The socket connects to the
 * address checked here, so a hostname can't pass validation and then re-resolve to an internal
 * IP for the real request (DNS rebinding).
 */
const publicOnlyLookup: LookupFunction = (hostname, options, callback) => {
    lookup(hostname, { all: true, verbatim: true })
        .then((addresses) => {
            const usable = addresses.filter(({ family }) => !options.family || family === options.family);
            if (usable.length === 0 || !addresses.every(({ address }) => isPublicAddress(address))) {
                callback(Object.assign(new Error(`Blocked non-public address for ${hostname}`), { code: "EBLOCKED" }), "", 4);
                return;
            }
            if (options.all) callback(null, usable);
            else callback(null, usable[0].address, usable[0].family);
        })
        .catch((error: NodeJS.ErrnoException) => callback(error, "", 4));
};

type RawResponse = { status: number; location: string | null; body: string };

function requestOnce(url: URL, method: string, maxBytes: number, signal: AbortSignal): Promise<RawResponse> {
    const send = url.protocol === "https:" ? httpsRequest : httpRequest;
    return new Promise((resolve, reject) => {
        const request = send(
            url,
            {
                method,
                signal,
                lookup: publicOnlyLookup,
                headers: { "user-agent": "UofTWebringBot/1.0 (+https://uoftwebring.com)", accept: "text/html,*/*" },
            },
            (response) => {
                const chunks: Buffer[] = [];
                let total = 0;
                const finish = () =>
                    resolve({
                        status: response.statusCode ?? 0,
                        location: response.headers.location ?? null,
                        body: Buffer.concat(chunks).subarray(0, maxBytes).toString("utf8"),
                    });
                response.on("data", (chunk: Buffer) => {
                    chunks.push(chunk);
                    total += chunk.byteLength;
                    // Enough to answer the question: stop downloading
                    if (total >= maxBytes) {
                        response.destroy();
                        finish();
                    }
                });
                response.on("end", finish);
                response.on("error", reject);
            }
        );
        request.on("error", reject);
        request.end();
    });
}

/**
 * Fetches a member-supplied URL. Every hop, redirects included, must resolve to public addresses
 * only, so a member's domain can't be used to probe our network.
 */
export async function safeFetch(
    raw: string,
    { method = "GET", timeoutMs = 5000, maxRedirects = 3, maxBytes = 0 }: SafeFetchOptions = {}
): Promise<SafeResponse | null> {
    const signal = AbortSignal.timeout(timeoutMs);
    let target = raw;

    for (let hop = 0; hop <= maxRedirects; hop++) {
        // Early, friendly rejection; publicOnlyLookup is what actually enforces it at connect time
        const url = await resolvePublicUrl(target);
        if (!url) return null;

        let response: RawResponse;
        try {
            response = await requestOnce(url, method, maxBytes, signal);
        } catch {
            return null;
        }

        if (response.status >= 300 && response.status < 400 && response.location) {
            target = new URL(response.location, url).toString();
            continue;
        }
        return { status: response.status, ok: response.status >= 200 && response.status < 300, body: response.body };
    }
    return null;
}
