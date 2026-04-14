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

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | Next.js 15 (App Router, Turbopack) |
| Language  | TypeScript                          |
| Styling   | Tailwind CSS 4                      |
| Database  | Supabase (Postgres + Auth + RLS)    |
| 3D        | Three.js, React Three Fiber         |
| Storage   | AWS S3 + CloudFront                 |
| Validation| Zod                                 |
| Analytics | PostHog                             |
| Hosting   | Vercel                              |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Run tests
npm test
```

You'll also need a local Supabase instance — see the [Supabase quickstart](supabase/README.md) for setup instructions.

### Environment Variables

Copy `.env.example` (or ask a maintainer) to `.env.local` and fill in your Supabase and AWS credentials.

## Project Structure

```
app/                    # Next.js App Router pages and API routes
  ├── auth/             # Authentication (OTP confirm, callback)
  ├── dashboard/        # User dashboard (edit profile, join, verify)
  ├── directory/        # Member directory
  ├── u/[slug]/         # Individual member pages
  └── actions.ts        # Server actions for profile queries
components/             # React components
  ├── Ring/             # 3D webring visualization
  ├── homeComponents/   # Landing page sections
  └── ui/               # Shared UI primitives (shadcn)
hooks/                  # Custom React hooks
providers/              # Context providers (auth, analytics)
utils/                  # Validation schemas, Supabase clients, helpers
__tests__/              # Unit tests (Vitest)
```

## Testing

Tests use [Vitest](https://vitest.dev/) and cover validation schemas, URL safety checks, and utility functions.

```bash
npm test              # Single run
npm run test:watch    # Watch mode
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, commit conventions, and PR guidelines.

## License

This project is maintained by UofT students. See the repository for license details.
