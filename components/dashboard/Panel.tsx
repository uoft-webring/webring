import { cn } from "@/lib/cn";

/**
 * Selected-tab style for dashboard tabs. The generated trigger marks the active tab with a 30%
 * input tint that's almost invisible on the dark theme; a solid primary fill reads at a glance.
 */
export const TAB_TRIGGER_CLASS =
    "hover:text-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

/**
 * Title block for a dashboard page. Sized explicitly because the global h2 (up to 2.5rem) is meant
 * for marketing pages and made every dashboard step shout.
 */
export function PageHeader({
    title,
    description,
    className,
}: {
    title: string;
    description?: React.ReactNode;
    className?: string;
}): React.JSX.Element {
    return (
        <header className={cn("flex flex-col gap-1", className)}>
            <h2 className="text-2xl font-semibold">{title}</h2>
            {description && <p className="text-muted-foreground text-base">{description}</p>}
        </header>
    );
}

/** The one surface for dashboard content: same radius, border and padding as the stats tiles. */
export function Panel({
    title,
    description,
    className,
    children,
}: {
    title?: string;
    description?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <section
            className={cn(
                "bg-card text-card-foreground flex flex-col gap-4 rounded-xl border p-5 sm:p-6",
                className
            )}
        >
            {(title || description) && (
                <div className="flex flex-col gap-1">
                    {title && <h3 className="text-lg font-semibold">{title}</h3>}
                    {description && <p className="text-muted-foreground text-base">{description}</p>}
                </div>
            )}
            {children}
        </section>
    );
}
