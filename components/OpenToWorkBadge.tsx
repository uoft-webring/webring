import { BriefcaseBusiness } from "lucide-react";
import { cn } from "@/lib/cn";

/** Shown on members looking for co-op / internship roles. Icon + text, never colour alone. */
export function OpenToWorkBadge({ className }: { className?: string }): React.JSX.Element {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border border-sky-400/60 bg-sky-400/15 px-2.5 py-0.5 text-xs font-semibold text-sky-200",
                className
            )}
        >
            <BriefcaseBusiness className="size-3.5" aria-hidden />
            Open to co-op / internships
        </span>
    );
}
