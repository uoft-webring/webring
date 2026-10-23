# Dashboard

Onboarding is three steps: **edit** your profile, **join** the ring (embed the prev/next widget on your
site) and **verify** domain ownership (DNS TXT record).

The layout and every page read the signed-in member through `requireOwnProfile()` (`lib/auth.ts`). It is
wrapped in React `cache`, so the profile is fetched once per request no matter how many server components
ask for it. `/dashboard/edit` hands that profile to a client editor that autosaves through the
`updateProfile` server action; the action re-validates everything on the server.
