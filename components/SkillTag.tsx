import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

// Soft tint + light text in the same hue: readable on the dark card without shouting
const SkillTagColors = [
    "border-red-400/30 bg-red-400/15 text-red-200",
    "border-orange-400/30 bg-orange-400/15 text-orange-200",
    "border-amber-400/30 bg-amber-400/15 text-amber-200",
    "border-yellow-400/30 bg-yellow-400/15 text-yellow-200",
    "border-lime-400/30 bg-lime-400/15 text-lime-200",
    "border-green-400/30 bg-green-400/15 text-green-200",
    "border-emerald-400/30 bg-emerald-400/15 text-emerald-200",
    "border-teal-400/30 bg-teal-400/15 text-teal-200",
    "border-cyan-400/30 bg-cyan-400/15 text-cyan-200",
    "border-sky-400/30 bg-sky-400/15 text-sky-200",
    "border-blue-400/30 bg-blue-400/15 text-blue-200",
    "border-indigo-400/30 bg-indigo-400/15 text-indigo-200",
    "border-violet-400/30 bg-violet-400/15 text-violet-200",
    "border-purple-400/30 bg-purple-400/15 text-purple-200",
    "border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-200",
    "border-pink-400/30 bg-pink-400/15 text-pink-200",
    "border-rose-400/30 bg-rose-400/15 text-rose-200",
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

const skillTagVariants = cva("rounded-full border px-3", {
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
}: {
    tagName: string;
    size?: "default" | "mini";
    removable?: boolean;
} & React.ComponentProps<"div">): React.JSX.Element {
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
            <p className="font-medium select-none">{tagName}</p>
            {removable && (
                <X className="ml-2 size-4 opacity-70 hover:opacity-100" aria-label={`Remove ${tagName}`} />
            )}
        </div>
    );
}
