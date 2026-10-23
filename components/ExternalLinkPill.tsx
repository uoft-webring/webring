import Image, { type StaticImageData } from "next/image";

/** Rounded link to a member's site, GitHub or one of their own links, shortening long labels. */
export function ExternalLinkPill({
    href,
    icon,
    label,
    fallbackLabel,
}: {
    href: string;
    /** A brand image (GitHub, globe), or an icon component for member-added links. */
    icon: StaticImageData | React.ReactNode;
    label: string;
    fallbackLabel: string;
}): React.JSX.Element {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-popover hover:bg-secondary/80 flex items-center rounded-full px-3 py-2.5 text-sm transition"
        >
            {icon && typeof icon === "object" && "src" in icon ? (
                <Image src={icon} alt="" width={20} height={20} className="mr-2" />
            ) : (
                <span className="mr-2 flex size-5 items-center justify-center" aria-hidden>
                    {icon}
                </span>
            )}
            {label.length <= 30 ? label : fallbackLabel}
        </a>
    );
}
