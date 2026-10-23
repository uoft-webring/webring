import { Link2 } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import { FiGithub } from "react-icons/fi";
import { cn } from "@/lib/cn";

const BRAND_ICONS = [
    { hosts: ["github.com"], Icon: FiGithub },
    { hosts: ["linkedin.com"], Icon: FaLinkedinIn },
];

/** A member's custom link icon: the site's mark for well-known hosts, a plain link otherwise. */
export function LinkIcon({ url, className }: { url: string; className?: string }): React.JSX.Element {
    let host = "";
    try {
        host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
        // Links are validated on save; an unparsable one just gets the plain icon
    }
    const brand = BRAND_ICONS.find(({ hosts }) => hosts.some((h) => host === h || host.endsWith(`.${h}`)));
    const Icon = brand?.Icon ?? Link2;
    return <Icon aria-hidden className={cn("size-5", className)} />;
}
