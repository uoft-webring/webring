# UofT Webring

A webring for University of Toronto students to showcase their personal websites and connect with each other. Members' sites are linked in a ring — each portfolio points to the next, creating a community-driven network of student work.

**[uoftwebring.com](https://uoftwebring.com)**

## Features

- **Interactive 3D Ring** — A Three.js visualization of the webring on the homepage
- **Student Directory** — Browse all members and their portfolios
- **Profile Pages** — Each member gets a page at `/u/{slug}` with their info, tags, and links
- **Ring Navigation** — Visit any member's site and navigate to the next/previous member in the ring
- **Profile Customization** — Set your tagline, avatar, skills/tags, program, and graduation year
- **UofT-only** — Sign up requires a `utoronto.ca` email address
- **Plain version** — A text-first view of the ring at `/plain`, with search and a 2D map of the ring
- **Ring stats** — Members see how many visitors the ring sent them (`/dashboard/stats`)
- **Site previews** — Profile pages show each site's own social preview image
- **Browse by tag or program** — `/tags/{tag}` and `/programs/{program}` pages, plus an "open to co-op" flag

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack, React Compiler) |
| Language  | TypeScript (strict)                 |
| Styling   | Tailwind CSS 4                      |
| Database  | Supabase (Postgres + Auth + RLS)    |
| 3D        | Three.js, React Three Fiber         |
| Storage   | AWS S3 + CloudFront                 |
| Validation| Zod                                 |
| Analytics | PostHog                             |
| Hosting   | Vercel                              |

## Getting Started

Requires Node 24 (`nvm use`), Docker and the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

```bash
npm install
cp .env.example .env          # local defaults; ask a maintainer for AWS values
supabase start                # local Postgres/Auth/Studio on ports 546xx
supabase db reset             # apply migrations + seed users
npm run dev
```

The local stack runs on ports **546xx** (API 54621, DB 54622, Studio 54623, Mailpit 54624) so it can run
alongside other local Supabase projects. Sign-in codes land in Mailpit at http://127.0.0.1:54624.

### Working with production data

`scripts/db-pull-prod.sh` copies production members into your **local** database. It only reads from
production (`supabase db dump`) and needs the repo linked with `supabase link`. Never point `.env` at the
production database.

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest
```

## Project Structure

```
app/                    # Routes, layouts and server actions (App Router)
  ├── auth/             # OTP sign-in/up actions, confirm + magic-link callback
  ├── dashboard/        # Member onboarding: edit, join (ring widget), verify (DNS TXT)
  ├── directory/        # Member directory
  └── u/[slug]/         # Public member pages
components/             # React components (ui/ holds shadcn primitives)
lib/                    # Server + shared logic
  ├── auth.ts           # Request-cached session/profile helpers
  ├── profiles/         # Domain types, DB row mapping, cached queries, ring navigation
  ├── supabase/         # Supabase clients (server, browser)
  ├── validation.ts     # Zod schemas shared by forms and server actions
  └── url-safety.ts     # SSRF-safe fetching of member URLs
proxy.ts                # /redirect ring navigation + session refresh
supabase/               # Migrations and declarative schema
__tests__/              # Unit tests (Vitest)
```

## Testing

Tests use [Vitest](https://vitest.dev/) and cover validation, ring navigation (including wrap-around), SSRF protection, ring-widget detection and DB row mapping.

```bash
npm test              # Single run
npm run test:watch    # Watch mode
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, commit conventions, and PR guidelines.

## License

This project is maintained by UofT students. See the repository for license details.
