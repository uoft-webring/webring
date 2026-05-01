"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ArrowUpRight, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePromoDisclosure, UOFTINDEX_URL } from "./usePromoDisclosure";

/** Routes where the promo would be distracting (auth + onboarding + dashboard). */
const HIDDEN_PREFIXES = ["/dashboard", "/signin", "/signup", "/auth"];

/**
 * Bottom-right corner banner promoting UofT Index.
 * - Desktop: pinned card in the bottom-right.
 * - Mobile: full-width bottom sheet.
 * Shown once per session; persistence rules live in usePromoDisclosure.
 */
export default function UoftIndexPromo() {
    const pathname = usePathname();
    const { open, remindLater, dismissForever, convert } = usePromoDisclosure();

    const hidden = HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p));

    return (
        <AnimatePresence>
            {open && !hidden && (
                <motion.div
                    role="dialog"
                    aria-label="UofT Index announcement"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[360px]"
                >
                    <div className="bg-popover text-popover-foreground border-border ring-primary/10 rounded-2xl border p-5 shadow-2xl ring-1 backdrop-blur-sm">
                        {/* Header: icon + title on the left, dismiss on the right */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                                    <GraduationCap className="size-4" />
                                </span>
                                <h3 className="text-foreground text-[15px] font-semibold">
                                    Meet UofT Index
                                </h3>
                            </div>
                            <button
                                onClick={remindLater}
                                aria-label="Dismiss"
                                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -mr-1 -mt-1 shrink-0 rounded-xs p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                            Courses, professors, program trees and grade distributions — everything you need
                            to plan your degree, in one place.
                        </p>

                        <Button asChild size="sm" className="mt-4 w-full">
                            <a href={UOFTINDEX_URL} target="_blank" rel="noopener" onClick={convert}>
                                Explore UofT Index
                                <ArrowUpRight className="size-4" />
                            </a>
                        </Button>

                        <div className="mt-3 text-center">
                            <button
                                onClick={dismissForever}
                                className="text-muted-foreground/60 hover:text-muted-foreground text-xs underline-offset-4 transition-colors hover:underline"
                            >
                                Don&apos;t show again
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
