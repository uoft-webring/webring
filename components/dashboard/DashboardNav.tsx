"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, Check, PanelsTopLeft } from "lucide-react";
import { cn } from "@/lib/cn";

type Step = { id: string; title: string; hint: string; done: boolean };

const SITE_LINKS = [
    { href: "/dashboard/page", title: "Page", hint: "About, projects, experience", icon: PanelsTopLeft },
    { href: "/dashboard/stats", title: "Stats", hint: "Visitors from the ring", icon: ChartColumn },
];

const linkBase =
    "group focus-visible:ring-ring/50 flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center outline-none transition-colors focus-visible:ring-[3px] md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-left";

function linkState(active: boolean): string {
    return active
        ? "bg-primary/10 text-foreground"
        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground";
}

/**
 * Dashboard side nav: the three onboarding steps, then stats. A step's check mark comes from the
 * member's real progress (passed in from the server), not from which page they're on.
 */
export function DashboardNav({ steps }: { steps: Step[] }): React.JSX.Element {
    const pathname = usePathname();

    return (
        <nav aria-label="Dashboard" className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <p className="text-muted-foreground hidden px-3 text-sm font-medium tracking-wide uppercase md:block">
                    Get on the ring
                </p>
                {/* Equal columns on small screens, a column beside the content from md up */}
                <ol className="grid grid-cols-5 gap-1 md:flex md:flex-col">
                    {steps.map((step, index) => {
                        const active = pathname.startsWith(`/dashboard/${step.id}`);
                        return (
                            <li key={step.id}>
                                <Link
                                    href={`/dashboard/${step.id}`}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(linkBase, linkState(active))}
                                >
                                    {/* Done steps show a check, so progress isn't told by colour alone */}
                                    <span
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                                            step.done && "bg-primary border-primary text-primary-foreground",
                                            !step.done && active && "border-primary text-primary",
                                            !step.done && !active && "group-hover:border-primary/60"
                                        )}
                                    >
                                        {step.done ? <Check className="size-4" aria-hidden /> : index + 1}
                                    </span>
                                    <span className="flex flex-col">
                                        <span className="text-sm font-medium md:text-base">
                                            {step.title}
                                            {step.done && <span className="sr-only"> (done)</span>}
                                        </span>
                                        <span className="text-muted-foreground hidden text-sm md:block">
                                            {step.hint}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                    {SITE_LINKS.map(({ href, title, icon: Icon }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <li key={href} className="md:hidden">
                                <Link
                                    href={href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(linkBase, linkState(active))}
                                >
                                    <span className="flex size-8 shrink-0 items-center justify-center">
                                        <Icon className="size-5" aria-hidden />
                                    </span>
                                    <span className="text-sm font-medium">{title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <div className="hidden flex-col gap-1 md:flex">
                <p className="text-muted-foreground px-3 text-sm font-medium tracking-wide uppercase">
                    Your site
                </p>
                {SITE_LINKS.map(({ href, title, hint, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={cn(linkBase, linkState(active))}
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center">
                                <Icon className="size-5" aria-hidden />
                            </span>
                            <span className="flex flex-col">
                                <span className="text-base font-medium">{title}</span>
                                <span className="text-muted-foreground text-sm">{hint}</span>
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
