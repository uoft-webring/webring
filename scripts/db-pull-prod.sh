#!/usr/bin/env bash
# Copies production member data into the LOCAL webring Supabase stack.
#
# Production is only ever read (`supabase db dump`); every write goes to the local container.
# Requires: the repo linked to the prod project (`supabase link`), and `supabase start` running.
set -euo pipefail

cd "$(dirname "$0")/.."
LOCAL_DB_CONTAINER="supabase_db_webring"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

if ! docker ps --format '{{.Names}}' | grep -qx "$LOCAL_DB_CONTAINER"; then
    echo "Local stack isn't running ($LOCAL_DB_CONTAINER). Run: supabase start" >&2
    exit 1
fi

echo "Dumping production data (read-only)..."
supabase db dump --linked --data-only --use-copy -f "$WORK_DIR/data.sql"
python3 scripts/filter-prod-dump.py "$WORK_DIR/data.sql" "$WORK_DIR/filtered.sql"

TABLES=$(grep -E '^COPY' "$WORK_DIR/filtered.sql" | awk '{print $2}' | paste -sd, -)
# Production keeps a few legacy rows that predate the profile check constraints (added NOT VALID).
# New inserts are checked even under NOT VALID, so lift them for the load and re-add them the same way.
{
    echo "BEGIN;"
    cat <<'SQL'
CREATE TEMP TABLE _profile_checks ON COMMIT DROP AS
    SELECT conname, regexp_replace(pg_get_constraintdef(oid), ' NOT VALID$', '') AS def
    FROM pg_constraint WHERE conrelid = 'public.profile'::regclass AND contype = 'c';
DO $$ DECLARE c record; BEGIN
    FOR c IN SELECT * FROM _profile_checks LOOP
        EXECUTE format('ALTER TABLE public.profile DROP CONSTRAINT %I', c.conname);
    END LOOP;
END $$;
SQL
    echo "TRUNCATE $TABLES CASCADE;"
    cat "$WORK_DIR/filtered.sql"
    cat <<'SQL'
DO $$ DECLARE c record; BEGIN
    FOR c IN SELECT * FROM _profile_checks LOOP
        EXECUTE format('ALTER TABLE public.profile ADD CONSTRAINT %I %s NOT VALID', c.conname, c.def);
    END LOOP;
END $$;
SQL
    echo "COMMIT;"
} > "$WORK_DIR/restore.sql"

echo "Restoring into $LOCAL_DB_CONTAINER..."
docker exec -i "$LOCAL_DB_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < "$WORK_DIR/restore.sql" > /dev/null
docker exec "$LOCAL_DB_CONTAINER" psql -U postgres -tAc \
    "select count(*) || ' profiles restored' from public.profile"
