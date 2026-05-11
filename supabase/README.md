# Local Development with Supabase

### Prerequisites

1. Docker Deamon (download for your OS)
2. Supabse CLI (downlaod for your OS)

### Important Information / Resources

This project uses the [declarative schema](https://supabase.com/docs/guides/local-development/declarative-database-schemas) model for Supabase migrations (Supabase will handle writing the migration SQL queries).

Three shell scripts that been created to aid the process of handling migrations.

> **NOTE**: shell script require extra permissions. Use `chmod +x example.sh` to give permissions to scripts.

- `handle_migration.sh` script handles creating the migrations
- `up_migration.sh` script handles integrating new migrations into local database (migration up)
- `down_migration.sh` script handles reverting migrations (migration down)

### Quick Start

1. cd into `supabase` directory
2. Start [local dev environment](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=macos&queryGroups=access-method&access-method=studio)
    1. `supabase start`
        > - Mailpit is used for testing mail functionality (port 54624)
        > - Supabase Studio is the same as the web Supabase dashboard (port 54623)
        > - Ports are 546xx (not the CLI default 543xx) so this stack can run next to other local Supabase projects
    2. `supabase db reset`

### General CLI Command Guide

- `supabase start` is used to start the supabase instance (start docker containers)
- `supabase db reset` resets the current configurations of the db to what your current migration folder looks like
- `supabase stop` is used to stop the supabase instance (stop docker containers)
- `supabase db diff -f {migration_name}` can be used to diff the current db configurations to what the updated schema looks like
    - though note that some SQL declarations do not get automatically created in the new migration (not sure why this is the case)
        - some I've noticed that follow the behaviour above include trigger creation and view creation.

### Production data locally

`../scripts/db-pull-prod.sh` dumps production (read-only) and restores member data into the local stack.

### Security model for `public.profile`

- `anon` has no access; public pages read through the service role with an explicit column list (never `email`).
- `authenticated` can `select` its own row and `update` only the editable profile columns (column grants).
  `is_verified`, `validated_user_component` and `ring_id` are written by the server with the service role.
- Changing `domain` resets verification via the `on_profile_domain_change` trigger.
- Check constraints mirror `lib/validation.ts`.
