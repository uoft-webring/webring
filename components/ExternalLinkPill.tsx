import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/cn";

/** Rounded link to a member's site, GitHub or one of their own links, shortening long labels. */
export function ExternalLinkPill({
    href,
    icon,
    label,
    fallbackLabel,
    className,
}: {
    href: string;
    /** A brand image (GitHub, globe), or an icon component for member-added links. */
    icon: StaticImageData | React.ReactNode;
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
            {icon && typeof icon === "object" && "src" in icon ? (
                <Image src={icon} alt="" width={20} height={20} className="size-5 shrink-0" />
            ) : (
                <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden>
                    {icon}
                </span>
            )}
            <span className="truncate">{label.length <= 30 ? label : fallbackLabel}</span>
        </a>
    );
}
