import Link from "next/link";

const SECTIONS = [
    { href: "/admin/ring", label: "Ring review" },
    { href: "/admin/email", label: "Email" },
] as const;

/** Tabs across the admin pages. `current` is the section's href. */
export function AdminNav({ current }: { current: (typeof SECTIONS)[number]["href"] }): React.JSX.Element {
    return (
        <nav aria-label="Admin" className="border-border mb-8 flex gap-1 border-b">
            {SECTIONS.map((section) => {
                const active = section.href === current;
                return (
                    <Link
                        key={section.href}
                        href={section.href}
                        aria-current={active ? "page" : undefined}
                        className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${
                            active ? "border-foreground text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"
                        }`}
                    >
                        {section.label}
                    </Link>
                );
            })}
        </nav>
    );
}
