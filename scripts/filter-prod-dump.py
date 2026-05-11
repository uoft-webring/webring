"""Keep only durable member data from a `supabase db dump --data-only` file.

Sessions, refresh tokens, OTPs and flow state are useless locally (different JWT secret) and are
often missing columns the local GoTrue version doesn't have, so they are dropped.

Usage: python3 scripts/filter-prod-dump.py <data.sql> <filtered.sql>
"""

import sys

KEEP = {'"auth"."users"', '"auth"."identities"', '"auth"."audit_log_entries"', '"public"."profile"'}


def main(src: str, dst: str) -> None:
    lines = open(src).readlines()
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("COPY "):
            end = i + 1
            while lines[end].rstrip("\n") != "\\.":
                end += 1
            if line.split()[1] in KEEP:
                out.extend(lines[i : end + 1])
            i = end + 1
            continue
        out.append(line)
        i += 1
    open(dst, "w").writelines(out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
