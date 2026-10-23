#!/usr/bin/env node
// Finds GitHub users whose bio mentions UofT and who list both a website and a public email, then
// posts them to /api/cron/invites/candidates, which skips ring members and anyone seen before.
// Nobody is emailed here: candidates wait as "pending" until an owner approves them.
//
// Prints counts only, never emails: it runs in GitHub Actions, whose logs are public.
//
//   GITHUB_TOKEN=… node scripts/find-invite-candidates.mjs --dry-run
//   GITHUB_TOKEN=… CRON_SECRET=… SITE_URL=https://uoftwebring.com node scripts/find-invite-candidates.mjs

const QUERIES = ['"University of Toronto" in:bio', "UofT in:bio", "utoronto in:bio"];
// GitHub search stops at 1000 results per query
const MAX_PAGES = 10;
const POST_CHUNK = 500;
// Same check the server makes; filtering here saves a profile lookup per non-match
const UOFT = /\b(university of toronto|uoft|u of t|utoronto|utsc|utm)\b/i;

const SEARCH = `query ($q: String!, $after: String) {
    search(query: $q, type: USER, first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { ... on User { login name websiteUrl bio } }
    }
}`;

const dryRun = process.argv.includes("--dry-run");
const { GITHUB_TOKEN, CRON_SECRET, SITE_URL = "https://uoftwebring.com" } = process.env;
if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is required");
if (!dryRun && !CRON_SECRET) throw new Error("CRON_SECRET is required (or pass --dry-run)");

// GitHub drops connections and rate-limits now and then over a run of ~1000 requests
async function fetchWithRetry(url, init) {
    for (let attempt = 1; ; attempt++) {
        try {
            const response = await fetch(url, init);
            const retryable = response.status >= 500 || response.status === 403 || response.status === 429;
            if (!retryable || attempt === 4) return response;
        } catch (error) {
            if (attempt === 4) throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
    }
}

// GraphQL only returns emails to tokens with the read:user scope; the REST profile shows the
// public email to any token, so look up just the users who passed the other filters
async function publicEmail(login) {
    const response = await fetchWithRetry(`https://api.github.com/users/${encodeURIComponent(login)}`, {
        headers: { authorization: `Bearer ${GITHUB_TOKEN}`, accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub profile lookup failed: ${response.status}`);
    return (await response.json()).email || null;
}

async function search(q, after) {
    const response = await fetchWithRetry("https://api.github.com/graphql", {
        method: "POST",
        headers: { authorization: `Bearer ${GITHUB_TOKEN}`, "content-type": "application/json" },
        body: JSON.stringify({ query: SEARCH, variables: { q: `${q} type:user`, after } }),
    });
    const body = await response.json();
    if (!response.ok || body.errors) throw new Error(`GitHub search failed: ${response.status} ${JSON.stringify(body.errors ?? "")}`);
    return body.data.search;
}

const matches = new Map();
let scanned = 0;
for (const q of QUERIES) {
    let after = null;
    for (let page = 0; page < MAX_PAGES; page++) {
        const result = await search(q, after);
        for (const user of result.nodes) {
            if (!user?.login) continue;
            scanned++;
            if (user.websiteUrl && user.bio && UOFT.test(user.bio)) matches.set(user.login, user);
        }
        if (!result.pageInfo.hasNextPage) break;
        after = result.pageInfo.endCursor;
    }
}

const candidates = [];
const users = [...matches.values()];
// A few at a time to stay clear of GitHub's secondary rate limits
for (let i = 0; i < users.length; i += 5) {
    const batch = users.slice(i, i + 5);
    const emails = await Promise.all(batch.map((user) => publicEmail(user.login)));
    batch.forEach((user, index) => {
        if (!emails[index]) return;
        candidates.push({
            githubLogin: user.login,
            name: user.name || null,
            email: emails[index],
            website: user.websiteUrl,
            bio: user.bio.slice(0, 500),
        });
    });
}
console.log(
    `Scanned ${scanned} profiles; ${users.length} mention UofT and list a website; ${candidates.length} of those have a public email.`
);
if (dryRun) process.exit(0);

const totals = { received: 0, valid: 0, alreadyMembers: 0, added: 0 };
for (let i = 0; i < candidates.length; i += POST_CHUNK) {
    const response = await fetch(new URL("/api/cron/invites/candidates", SITE_URL), {
        method: "POST",
        headers: { authorization: `Bearer ${CRON_SECRET}`, "content-type": "application/json" },
        body: JSON.stringify(candidates.slice(i, i + POST_CHUNK)),
    });
    const { data, error } = await response.json();
    if (!response.ok || error) throw new Error(`Import failed: ${response.status} ${error}`);
    for (const key of Object.keys(totals)) totals[key] += data[key];
}
console.log(
    `Sent ${totals.received}; ${totals.valid} passed validation; ${totals.alreadyMembers} already in the ring; ${totals.added} new pending candidates.`
);
