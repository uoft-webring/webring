import Image, { type StaticImageData } from "next/image";

/** Rounded link to a member's site or GitHub, shortening long labels. */
export function ExternalLinkPill({
    href,
    icon,
    label,
    fallbackLabel,
}: {
    href: string;
    icon: StaticImageData;
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
            <Image src={icon} alt="" width={20} height={20} className="mr-2" />
            {label.length <= 30 ? label : fallbackLabel}
        </a>
    );
}
