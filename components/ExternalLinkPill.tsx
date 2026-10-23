import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/cn";

/** Rounded link to a member's site or GitHub, shortening long labels. */
export function ExternalLinkPill({
    href,
    icon,
    label,
    fallbackLabel,
    className,
}: {
    href: string;
    icon: StaticImageData;
    label: string;
    fallbackLabel: string;
    className?: string;
}): React.JSX.Element {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "bg-popover hover:bg-secondary/80 flex min-w-0 items-center gap-2 rounded-full px-3 py-2.5 text-sm transition",
                className
            )}
        >
            <Image src={icon} alt="" width={20} height={20} className="size-5 shrink-0" />
            <span className="truncate">{label.length <= 30 ? label : fallbackLabel}</span>
        </a>
    );
}
