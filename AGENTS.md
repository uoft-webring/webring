<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UofT Webring — Agent Guide

Webring of University of Toronto student sites (uoftwebring.com): signup with UofT email, member dashboard, public directory, and prev/next `/redirect` links that members embed on their own sites.

## Work efficiently

- Make the smallest correct change.
- Search before reading; read only relevant files/ranges.
- Don't reread established context or load lockfiles, build output, generated files, or unrelated docs.
- Flow: `search → inspect → edit → targeted verification`. Stop gathering context once the change is safe.

## Sources of truth

- Next.js: relevant files under `node_modules/next/dist/docs/`
- Database: `supabase/migrations/` is canonical; keep `supabase/schemas/` (declarative) in sync with it. Never trust seed files.
- Validation: `lib/validation.ts` mirrors the `public.profile` check constraints. Change both together.

## Architecture

- Client code never imports `lib/supabase/server.ts`, `lib/auth.ts` or `lib/profiles/queries.ts` (all `server-only`). Pages read data in Server Components and pass it down; mutations go through server actions (`app/**/actions.ts`).
- Validate all server action and API input with Zod on the server, even if the client validated it too.
- Server actions and API routes return `Result<T>` from `lib/result.ts`: `{ data: T | null, error: string | null }`.
- Map DB rows to domain objects (`lib/profiles/mapper.ts`): components use camelCase `PublicProfile`/`OwnProfile`, never raw rows.
- Session and own profile: `getAuthUser()` / `getOwnProfile()` / `requireOwnProfile()` in `lib/auth.ts` (React `cache`d per request). Don't call `supabase.auth.getUser()` directly.
- The service-role client (`createAdminClient`) bypasses RLS. Use it only for public-column reads or writes the server has already authorised.
- Fetch member-supplied URLs only through `lib/url-safety.ts` (`safeFetch`): SSRF protection.
- No TanStack Query: there is no client-side data fetching.
- `proxy.ts` (not `middleware.ts`) handles `/redirect` and Supabase session refresh.

## React/UI

- React Compiler is enabled (`reactCompiler: true`): avoid `useMemo`, `useCallback`, `React.memo`.
- Don't edit generated `components/ui/` primitives.
- Interactive UI needs loading, error, empty, focus, reduced-motion, and non-colour-only states.
- The landing page 3D scene must degrade gracefully (WebGL error fallback, reduced motion renders it still, no SSR of browser-only code). Keep it cheap: shared geometries/materials, one `useFrame`, capped `dpr`, no post-processing.
- Never show raw error messages. Errors render `app/error.tsx` / `app/global-error.tsx`, which always link home.
- Copy and design are intentional (404 pages, manifesto, toasts, status text). Don't reword or restyle them unless asked.

## Code conventions

- Strict TypeScript; no `any`.
- Named exports except `page.tsx`, `layout.tsx`, `proxy.ts`.
- Explicit return types on exported functions.
- Comments explain why.
- Reuse existing helpers.
- Parallelize independent server reads with `Promise.all`.
- Use `next/image` with explicit dimensions.

## Caching

Cached DB reads use `unstable_cache` with explicit `revalidate` and at least one tag (profiles: `PROFILES_TAG` in `lib/profiles/queries.ts`). After a mutation, call `updateTag(PROFILES_TAG)` in the server action. Don't migrate to Cache Components without an explicit decision.

The root layout must stay static-friendly: don't read cookies in `Footer` or other root-layout components.

## Safety

- Use the DB CLI for migrations (`supabase migration new <name>`); don't invent filenames.
- Never write to the production database. Production data comes to local via `scripts/db-pull-prod.sh` (read-only dump).
- The local stack is project `webring` on ports 546xx. Other Supabase stacks on the machine (e.g. `ku-db`, `uoft-index`) are off-limits: never stop/reset them.
- Never wipe or bulk-modify member/site data without explicit approval.
- A push deploys to production. Pushing a git tag runs `supabase db push` against production.

## Domain invariants

- Signup requires a UofT email: `utoronto.ca` or its `mail.`/`alum.`/`alumni.` subdomains. Enforced in `lib/validation.ts` and the `check_uoft_email` trigger; keep them identical.
- `/redirect?nav=prev|next&id=…` is embedded on members' sites: never break its URL shape, and always resolve to a valid member (wrap around at the ends).
- The redirect chain includes only members with a valid http(s) domain (`ringMembers` in `lib/profiles/ring.ts`).
- `/redirect` records hops in `ring_visit_daily` via `record_ring_hop` after the response (`event.waitUntil`); it must never slow or block the redirect. Bots and prefetches aren't counted.
- `/api/preview/[ringId]` only fetches ring members' own domains, through `safeFetch`, and always re-encodes the image.
- Two front doors for now: the 3D site (`/`) and the plain version (`/plain`). Keep both working; the plain one may become the default.
- Treat member emails as private; never expose them in public APIs.

## Verification

Run the smallest relevant check first:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Do NOT write headless-Chrome or scraping code. The human checks visuals and sends screenshots. Add tests to the existing test corpus instead.

Before finishing, inspect the diff and remove unrelated changes. Never claim a check passed unless it ran.

## Reporting to the owner

Short, in this order, skipping empty sections:

1. **Done** — one bullet per change, with what changed and why.
2. **Problems** — broken, blocked, or risky items.
3. **Your actions** — numbered owner-only steps with exact commands or clicks.
