"use client";

import { useDeferredValue, useState } from "react";
import { HorizontalProfileCard } from "@/components/HorizontalProfileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicProfile } from "@/lib/profiles/types";
import { Filter } from "./Filter";

const PAGE_SIZE = 20;

export type DirectoryFilters = { tags: string[]; programs: string[]; graduationYears: string[] };

type Selection = { tag: string | null; program: string | null; graduationYear: string | null };

const NO_SELECTION: Selection = { tag: null, program: null, graduationYear: null };

function searchText(profile: PublicProfile): string {
    return [profile.name, profile.domain, ...profile.tags, profile.program ?? "", profile.graduationYear ?? ""]
        .join(" ")
        .toLowerCase();
}

function matches(profile: PublicProfile, query: string, selection: Selection): boolean {
    if (query && !searchText(profile).includes(query)) return false;
    if (selection.tag && !profile.tags.includes(selection.tag)) return false;
    if (selection.program && profile.program !== selection.program) return false;
    if (selection.graduationYear && String(profile.graduationYear) !== selection.graduationYear) return false;
    return true;
}

export function DirectoryBrowser({
    profiles,
    filters,
}: {
    profiles: PublicProfile[];
    filters: DirectoryFilters;
}): React.JSX.Element {
    const [query, setQuery] = useState("");
    const [selection, setSelection] = useState<Selection>(NO_SELECTION);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Keep typing responsive on long lists
    const deferredQuery = useDeferredValue(query.trim().toLowerCase());
    const filtered = profiles.filter((profile) => matches(profile, deferredQuery, selection));

    // Changing the search starts paging from the top again
    const select = (next: Partial<Selection>) => {
        setSelection((prev) => ({ ...prev, ...next }));
        setVisibleCount(PAGE_SIZE);
    };
    const search = (value: string) => {
        setQuery(value);
        setVisibleCount(PAGE_SIZE);
    };

    return (
        <div className="container mx-auto max-w-[75rem] px-4 py-6">
            <h1 className="mb-6 skew-y-2 cursor-crosshair text-center text-3xl font-black tracking-widest underline decoration-pink-500 decoration-wavy drop-shadow-lg sm:text-5xl">
                The Directory
            </h1>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="flex-1">
                        <span className="text-muted-foreground text-sm">Search</span>
                        <Input
                            type="search"
                            value={query}
                            onChange={(e) => search(e.target.value)}
                            placeholder="Search by name, domain, tags, program…"
                            className="bg-card flex-1 rounded-xl"
                        />
                    </label>
                    <Filter label="Tags" options={filters.tags} value={selection.tag} onChange={(tag) => select({ tag })} />
                    <Filter
                        label="Programs"
                        options={filters.programs}
                        value={selection.program}
                        onChange={(program) => select({ program })}
                    />
                    <Filter
                        label="Graduation Years"
                        options={filters.graduationYears}
                        value={selection.graduationYear}
                        onChange={(graduationYear) => select({ graduationYear })}
                    />
                    <Button
                        variant="secondary"
                        onClick={() => {
                            search("");
                            select(NO_SELECTION);
                        }}
                        className="h-10 rounded-xl sm:self-end"
                    >
                        Clear
                    </Button>
                </div>

                <p className="sr-only" aria-live="polite">
                    {filtered.length} {filtered.length === 1 ? "member" : "members"} found
                </p>
                <div className="grid grid-cols-1 gap-4">
                    {filtered.slice(0, visibleCount).map((profile) => (
                        <HorizontalProfileCard key={profile.ringId} profile={profile} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-muted-foreground mt-6 flex flex-col items-center gap-2 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full border border-dashed">
                                <span className="text-lg" aria-hidden>
                                    😕
                                </span>
                            </div>
                            <p className="text-sm">No profiles match your search or filters.</p>
                            <span className="text-xs italic opacity-70">Try changing filters or search terms</span>
                        </div>
                    )}
                    {visibleCount < filtered.length && (
                        <div className="flex justify-center py-4">
                            <Button
                                variant="outline"
                                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                                className="rounded-xl"
                            >
                                Show more ({filtered.length - visibleCount} remaining)
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
