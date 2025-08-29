"use client";

import { useMemo, useState, useDeferredValue, useCallback } from "react";
import HorizontalProfileCard from "@/components/HorizontalProfileCard";
import Filter from "@/components/Filter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfiles } from "./ProfileProvider";
import { SafeUserType } from "@/utils/zod";

type SelectedFilters = {
    tags: string | null;
    programs: string | null;
    "Graduation Years": string | null;
};

// Normalize string for case-insensitive search
const normalize = (s: any): string | null => {
    if (s == null) return null;
    const str = String(s).trim();
    if (!str) return null;
    return str.toLowerCase().normalize();
};
const toLower = (s: string | null | undefined) => (s ? s.toLowerCase() : null);

type SearchRow = {
    profile: SafeUserType;
    text: string;
    tags: string[];
    program: string | null;
    gradYear: string | null;
    key: string;
};

export default function DirectoryPage() {
    const { profiles, filterMetrics } = useProfiles();

    // Search/select state
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<SelectedFilters>({
        tags: null,
        programs: null,
        "Graduation Years": null,
    });

    const setSelectedFilter = useCallback((filterName: keyof SelectedFilters, newValue: string | null) => {
        setSelected((prevFilters) => ({
            ...prevFilters,
            [filterName]: newValue,
        }));
    }, []);

    // Defer typing to keep UI responsive on large lists
    const deferredQuery = normalize(useDeferredValue(query));

    // Every time profiles change, we recompute the index which is an array of SearchRow's
    const index: SearchRow[] = useMemo(() => {
        return profiles.map((p): SearchRow => {
            // To build a search index, strip every thing of it's case
            const tags = (p.tags ?? []).map((t) => t.toLowerCase());
            const program = toLower(p.program);
            const gradYear = p.graduation_year != null ? String(p.graduation_year) : null;
            // build once, lowercased for case insensitive query
            const text = [p.name, p.domain, ...tags, program ?? "", gradYear ?? ""]
                .filter(Boolean)
                .map((x) => toLower(x as string))
                .join(" ");

            // Solely for rendering
            const key = String(p.ring_id);

            return { profile: p, text, tags, program, gradYear, key };
        });
    }, [profiles]);

    const filtered: SafeUserType[] = useMemo(() => {
        return index
            .filter((row) => {
                // For each row
                // No match on search query
                if (deferredQuery && !row.text.includes(deferredQuery)) return false;
                // Tags don't match
                if (selected.tags && !row.tags.includes(selected.tags.toLowerCase())) return false;
                // Program doesn't match
                if (selected.programs && row.program !== selected.programs.toLowerCase()) return false;
                // Graduation year doesn't match
                if (selected["Graduation Years"] && row.gradYear !== selected["Graduation Years"])
                    return false;
                return true;
            })
            .map((r) => r.profile);
        // Every time the user types, the index is recomputed or the selected filters change, then this filter is run
    }, [index, deferredQuery, selected]);

    const clearAll = () => {
        setQuery("");
        setSelected({ tags: null, programs: null, "Graduation Years": null });
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-[75rem]">
            <h1 className="text-center text-5xl font-black mb-6 tracking-widest decoration-wavy decoration-pink-500 underline cursor-crosshair skew-y-2 drop-shadow-lg">
                The Directory
            </h1>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Search</span>
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, domain, tags, program…"
                            className="bg-card rounded-xl flex-1"
                        />
                    </div>
                    {/*                     <div className="flex gap-3 w-full sm:w-auto h-full items-center justify-around">
                     */}{" "}
                    <Filter
                        label="Tags"
                        options={filterMetrics?.tags ?? []}
                        value={selected.tags}
                        onChange={(v) => setSelectedFilter("tags", v)}
                    />
                    <Filter
                        label="Programs"
                        options={filterMetrics?.programs ?? []}
                        value={selected.programs}
                        onChange={(v) => setSelectedFilter("programs", v)}
                    />
                    <Filter
                        label="Graduation Years"
                        options={filterMetrics?.["Graduation Years"] ?? []}
                        value={selected["Graduation Years"]}
                        onChange={(v) => setSelectedFilter("Graduation Years", v)}
                    />
                    {/*                     </div>
                     */}{" "}
                    <Button variant="secondary" onClick={clearAll} className="rounded-xl sm:self-end h-10">
                        Clear
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filtered.map((p: any) => (
                        /* TODO: after domain is made unique this wont matter */
                        <HorizontalProfileCard key={String(p.domain + p.ring_id)} user={p} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="mt-6 flex flex-col items-center text-center gap-2 text-muted-foreground">
                            <div className="flex items-center justify-center size-12 rounded-full border border-dashed">
                                <span className="text-lg">😕</span>
                            </div>
                            <p className="text-sm">No profiles match your search or filters.</p>
                            <span className="text-xs italic opacity-70">
                                Try changing filters or search terms
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
