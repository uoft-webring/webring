import type { DailyVisits } from "@/lib/profiles/stats";

const dayLabel = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", timeZone: "UTC" });

function formatDay(day: string): string {
    return dayLabel.format(new Date(`${day}T00:00:00Z`));
}

/**
 * Daily visitors sent to the member's site. One series, so no legend: the heading names it.
 * Server-rendered; hover/focus tooltips are CSS-only, and a table carries the same data for screen readers.
 */
export function VisitsChart({ days }: { days: DailyVisits[] }): React.JSX.Element {
    const max = Math.max(...days.map((day) => day.inbound));
    const title = "Visitors sent to you per day";

    return (
        <figure className="bg-card rounded-xl border p-5">
            <figcaption className="mb-4 flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium">{title}</span>
                {max > 0 && (
                    <span className="text-muted-foreground text-sm tabular-nums">Busiest day: {max}</span>
                )}
            </figcaption>

            {max === 0 ? (
                <p className="text-muted-foreground flex h-40 items-center justify-center text-sm">
                    No ring visits yet. They&apos;ll show up here as people hop through the ring.
                </p>
            ) : (
                <div className="border-border flex h-40 items-end gap-[2px] border-b">
                    {days.map((day) => (
                        <div key={day.day} className="group relative flex h-full flex-1 items-end">
                            {/* Hit target is the full column, not just the (possibly tiny) bar */}
                            <div
                                tabIndex={0}
                                role="img"
                                aria-label={`${formatDay(day.day)}: ${day.inbound} in, ${day.outbound} out`}
                                className="bg-primary focus-visible:ring-ring w-full rounded-t-[4px] outline-none group-hover:opacity-80 focus-visible:ring-2"
                                style={{
                                    height: `${(day.inbound / max) * 100}%`,
                                    minHeight: day.inbound ? 2 : 0,
                                }}
                            />
                            <span
                                aria-hidden
                                className="bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-md border px-2 py-1 text-xs whitespace-nowrap shadow-md group-focus-within:block group-hover:block"
                            >
                                {formatDay(day.day)}: {day.inbound} in · {day.outbound} out
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {max > 0 && (
                <div aria-hidden className="text-muted-foreground mt-2 flex justify-between text-sm">
                    <span>{formatDay(days[0].day)}</span>
                    <span>{formatDay(days[days.length - 1].day)}</span>
                </div>
            )}

            {/* sr-only on a wrapper: a table's <caption> is laid out outside the table box and would show */}
            <div className="sr-only">
                <table>
                    <caption>{title}</caption>
                    <thead>
                        <tr>
                            <th scope="col">Day</th>
                            <th scope="col">Visitors sent to you</th>
                            <th scope="col">Visitors you sent on</th>
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day) => (
                            <tr key={day.day}>
                                <td>{formatDay(day.day)}</td>
                                <td>{day.inbound}</td>
                                <td>{day.outbound}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </figure>
    );
}
