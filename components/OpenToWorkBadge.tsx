import { cn } from "@/lib/cn";

/**
 * Shown on members looking for internship roles. A static "available" dot (no ping: a page of
 * cards would all pulse at once) and the text carries the meaning, so it never relies on colour alone.
 */
export function OpenToWorkBadge({ className }: { className?: string }): React.JSX.Element {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200 ring-1 ring-emerald-400/25 ring-inset",
                className
            )}
        >
            <span
                aria-hidden
                className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px] shadow-emerald-400/20"
            />
            Open to internships
        </span>
    );
}
