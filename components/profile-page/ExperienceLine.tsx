import { TrainFront } from "lucide-react";
import { cn } from "@/lib/cn";
import { experienceRange, sortExperience } from "@/lib/profiles/experience";
import type { Experience } from "@/lib/validation";

/**
 * Roles drawn as stops on the member's own line, in their accent colour: open stations for past
 * roles, a filled one for where they are now.
 */
export function ExperienceLine({ experience }: { experience: Experience[] }): React.JSX.Element {
    return (
        <section className="bg-card border-border rounded-3xl border p-5 shadow-lg sm:p-10" aria-labelledby="experience">
            <h2 id="experience" className="mb-8 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                <TrainFront className="h-7 w-7 text-(--profile-accent)" aria-hidden />
                Experience
            </h2>
            <ol className="ml-2.5 space-y-10 border-l-4 border-(--profile-accent) pl-8">
                {sortExperience(experience).map((entry) => (
                    <li key={`${entry.role}-${entry.organization}-${entry.start}`} className="relative">
                        <span
                            aria-hidden
                            className={cn(
                                "absolute top-0.5 -left-[2.75rem] size-5 rounded-full border-4 border-(--profile-accent)",
                                entry.end ? "bg-card" : "bg-(--profile-accent)"
                            )}
                        />
                        <p className="text-muted-foreground text-sm tabular-nums">{experienceRange(entry)}</p>
                        <h3 className="mt-1 text-lg leading-snug font-semibold">{entry.role}</h3>
                        <p className="text-foreground/80">{entry.organization}</p>
                        {entry.description && (
                            <p className="text-muted-foreground mt-2 max-w-[68ch] text-sm text-pretty break-words">
                                {entry.description}
                            </p>
                        )}
                    </li>
                ))}
            </ol>
        </section>
    );
}
