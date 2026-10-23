import type { Experience } from "@/lib/validation";

/** "2024-09" -> "Sep 2024". Built in UTC so the month never shifts with the server's timezone. */
export function formatMonth(month: string): string {
    const [year, monthIndex] = month.split("-").map(Number);
    return new Date(Date.UTC(year, monthIndex - 1, 1)).toLocaleString("en-CA", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

export function experienceRange(entry: Experience): string {
    return `${formatMonth(entry.start)} – ${entry.end ? formatMonth(entry.end) : "Present"}`;
}

/** Current roles first, then most recent; members don't have to keep the list in order themselves. */
export function sortExperience(entries: Experience[]): Experience[] {
    return entries.toSorted((a, b) => {
        if (!a.end !== !b.end) return a.end ? 1 : -1;
        return (b.end || b.start).localeCompare(a.end || a.start) || b.start.localeCompare(a.start);
    });
}
