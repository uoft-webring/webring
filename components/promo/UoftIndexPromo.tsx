"use client";

import { usePathname } from "next/navigation";
import { ArrowUpRight, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { uoftIndexUrl } from "@/lib/uoftindex";
import { usePromoDisclosure } from "./usePromoDisclosure";

/** Routes where the promo would be distracting (auth + onboarding + dashboard). */
const HIDDEN_PREFIXES = ["/dashboard", "/signin", "/signup", "/auth"];

/**
 * Bottom-right corner banner promoting UofT Index.
 * - Desktop: pinned card in the bottom-right.
 * - Mobile: full-width bottom sheet.
 * Shown once per session; persistence rules live in usePromoDisclosure.
 * Animated with CSS rather than a motion library: this ships on every page.
 */
export function UoftIndexPromo(): React.JSX.Element | null {
    const pathname = usePathname();
    const { open, closing, remindLater, dismissForever, convert } = usePromoDisclosure();

    const hidden = HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p));
    if (!open || hidden) return null;

    return (
        <div
            role="dialog"
            aria-label="UofT Index announcement"
            // Same motion as before (fade + 12px rise, 350ms, expo-out), in CSS instead of a JS animation library
            className={cn(
                "fixed inset-x-4 bottom-4 z-40 duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[360px]",
                closing
                    ? "animate-out fade-out slide-out-to-bottom-3 fill-mode-forwards"
                    : "animate-in fade-in slide-in-from-bottom-3"
            )}
        >
            <div className="bg-popover text-popover-foreground border-primary/40 rounded-2xl border p-5 shadow-2xl">
                {/* Header: icon + title on the left, dismiss on the right */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="bg-primary/20 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                            <GraduationCap className="size-4" />
                        </span>
                        <h3 className="text-foreground text-base font-semibold">Meet UofT Index</h3>
                    </div>
                    <button
                        onClick={remindLater}
                        aria-label="Dismiss"
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -my-2.5 -mr-2.5 shrink-0 rounded-md p-3.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <p className="text-popover-foreground mt-3 text-sm leading-relaxed">
                    Courses, professors, program trees and grade distributions — everything you need to plan
                    your degree, in one place.
                </p>

                {/* Light button on the dark card: the theme's primary pairing was ~4.6:1 and read dim */}
                <Button
                    asChild
                    className="bg-foreground text-background hover:bg-foreground/90 mt-4 h-11 w-full text-base font-semibold"
                >
                    <a
                        href={uoftIndexUrl("banner")}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={convert}
                    >
                        Explore UofT Index
                        <ArrowUpRight className="size-4" />
                    </a>
                </Button>

                <div className="mt-2 text-center">
                    <button
                        onClick={dismissForever}
                        className="text-muted-foreground hover:text-foreground px-2 py-2 text-xs underline-offset-4 transition-colors hover:underline"
                    >
                        Don&apos;t show again
                    </button>
                </div>
            </div>
        </div>
    );
}
