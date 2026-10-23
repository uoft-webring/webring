"use client";

import { useState } from "react";
import { RingGraph } from "./RingGraph";
import type { PlainMember } from "./types";

function matchesQuery(member: PlainMember, query: string): boolean {
    if (!query) return true;
    return [member.name, member.year ?? "", member.label].join(" ").toLowerCase().includes(query);
}

function SearchBox({
    id,
    value,
    onChange,
    className,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}): React.JSX.Element {
    return (
        <div className={className}>
            <label htmlFor={id} className="sr-only">
                Search by name, year or URL
            </label>
            <input
                id={id}
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search by name, year or URL…"
                autoComplete="off"
                className="w-full border border-[#9aa7c2] bg-[#fafcff] px-4 py-3 text-[17px] tracking-wide text-[#14213d] [font-variant:small-caps] placeholder:text-[#5b6b88] focus:border-[#1E3765] focus:ring-2 focus:ring-[#1E3765]/25 focus:outline-none"
            />
        </div>
    );
}

/**
 * Table + graph share one search. The table is server-rendered with every member, so the page
 * works without JavaScript; search only narrows it down.
 */
export function PlainRing({
    members,
    intro,
    decoration,
}: {
    members: PlainMember[];
    intro: React.ReactNode;
    decoration: React.ReactNode;
}): React.JSX.Element {
    const [query, setQuery] = useState("");
    const normalized = query.trim().toLowerCase();
    const visible = members.filter((member) => matchesQuery(member, normalized));

    return (
        <div className="grid grid-cols-1 gap-x-16 lg:grid-cols-2">
            <div className="min-w-0">
                {intro}
                {/* Mobile: search sits above the list. Desktop uses the one above the graph. */}
                <SearchBox
                    id="plain-search-mobile"
                    value={query}
                    onChange={setQuery}
                    className="mt-10 lg:hidden"
                />
                <table className="mt-10 w-full table-fixed border-collapse lg:mt-16">
                    <caption className="sr-only">Sites in the UofT Webring, in ring order</caption>
                    <colgroup>
                        <col className="w-[46%]" />
                        <col className="w-[16%]" />
                        <col />
                    </colgroup>
                    <thead>
                        <tr className="text-left text-2xl text-[#1E3765] italic">
                            <th scope="col" className="pb-6 font-normal tracking-wide">
                                Name
                            </th>
                            <th scope="col" className="pr-4 pb-6 text-right font-normal tracking-wide">
                                Year
                            </th>
                            <th scope="col" className="pb-6 font-normal tracking-wide">
                                URL
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((member) => (
                            <tr key={member.ringId} className="align-baseline">
                                <td className="py-1.5 pr-3 text-lg break-words [font-variant:small-caps]">
                                    {member.name}
                                </td>
                                <td className="py-1.5 pr-4 text-right text-base tabular-nums">
                                    {member.year ?? ""}
                                </td>
                                <td className="py-1.5 break-all">
                                    <a
                                        href={member.domain}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-[family-name:var(--font-plain-mono)] text-[15px] text-[#006a8a] underline decoration-1 underline-offset-[3px] hover:text-[#1E3765]"
                                    >
                                        {member.label}
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-6 text-[#4a5a78] italic">
                                    {normalized ? `No sites match “${query.trim()}”.` : "No sites in the ring yet."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-12 min-w-0 lg:mt-0">
                {decoration}
                <div className="lg:sticky lg:top-6">
                    <SearchBox
                        id="plain-search"
                        value={query}
                        onChange={setQuery}
                        className="mb-2 hidden lg:block"
                    />
                    <RingGraph members={members} matches={(member) => matchesQuery(member, normalized)} />
                </div>
            </div>
        </div>
    );
}
