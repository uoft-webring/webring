import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const SkillTagColors = [
    "border-red-400/80 bg-red-400/40",
    "border-orange-400/80 bg-orange-400/40",
    "border-amber-400/80 bg-amber-400/40",
    "border-yellow-400/80 bg-yellow-400/40",
    "border-lime-400/80 bg-lime-400/40",
    "border-green-400/80 bg-green-400/40",
    "border-emerald-400/80 bg-emerald-400/40",
    "border-teal-400/80 bg-teal-400/40",
    "border-cyan-400/80 bg-cyan-400/40",
    "border-sky-400/80 bg-sky-400/40",
    "border-blue-400/80 bg-blue-400/40",
    "border-indigo-400/80 bg-indigo-400/40",
    "border-violet-400/80 bg-violet-400/40",
    "border-purple-400/80 bg-purple-400/40",
    "border-fuchsia-400/80 bg-fuchsia-400/40",
    "border-pink-400/80 bg-pink-400/40",
    "border-rose-400/80 bg-rose-400/40",
];

// Hash the tag name so a tag always gets the same colour
function mapSkillToColor(skill: string) {
    let hash = 0;
    for (let i = 0; i < skill.length; i++) {
        hash = (hash << 5) - hash + skill.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % SkillTagColors.length;
    return SkillTagColors[index];
}

const skillTagVariants = cva("rounded-full border-1 px-3", {
    variants: {
        size: {
            default: "py-1",
            mini: "py-0.5",
        },
    },
    defaultVariants: { size: "default" },
});

export function SkillTag({
    tagName,
    size = "default",
    removable = false,
    className,
    ...props
}: { tagName: string; size?: "default" | "mini"; removable?: boolean } & React.ComponentProps<"div">): React.JSX.Element {
    return (
        <div
            className={cn(
                skillTagVariants({ size }),
                mapSkillToColor(tagName),
                removable && "mx-1 flex items-center justify-center",
                className
            )}
            {...props}
        >
            <p className={cn(size === "mini" ? "font-medium" : "font-bold", "text-white select-none")}>{tagName}</p>
            {removable && <X className="ml-2 size-4 text-white hover:text-red-500" aria-label={`Remove ${tagName}`} />}
        </div>
    );
}
