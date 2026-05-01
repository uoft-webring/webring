"use client";

import { useCallback, useEffect, useState } from "react";
import posthog from "posthog-js";

/**
 * Shared "show this promo once" logic for the UofT Index cross-promo.
 *
 * The UI (corner banner today, modal tomorrow) is intentionally decoupled from
 * this hook so we can swap presentations without touching the persistence rules.
 *
 * Persistence model:
 *  - localStorage `PROMO_KEY`   -> the user's durable decision across sessions.
 *       "dismissed" = never show again. "remind" = show again next visit.
 *       (absent)    = has never seen it -> treat like "remind".
 *  - sessionStorage `SEEN_KEY`  -> "already popped this session" guard so a page
 *       reload or hard refresh doesn't re-trigger the banner mid-session.
 */
const PROMO_KEY = "uoftindex_promo_v1";
const SEEN_KEY = "uoftindex_promo_seen";

type Decision = "remind" | "dismissed";

/** How long after mount before the promo slides in (ms). Deliberately unhurried
 *  so it never competes with first paint / the hero. */
const REVEAL_DELAY = 3000;

function readDecision(): Decision | null {
    try {
        const v = window.localStorage.getItem(PROMO_KEY);
        return v === "dismissed" || v === "remind" ? v : null;
    } catch {
        return null;
    }
}

function writeDecision(decision: Decision) {
    try {
        window.localStorage.setItem(PROMO_KEY, decision);
    } catch {
        /* storage blocked (private mode / cookies off) — fail silently */
    }
}

export type PromoDisclosure = {
    /** Whether the promo UI should currently be visible. */
    open: boolean;
    /** User asked to be reminded — resurfaces next session. */
    remindLater: () => void;
    /** User opted out permanently. */
    dismissForever: () => void;
    /** User clicked through to the product (treated as a permanent dismiss). */
    convert: () => void;
};

export function usePromoDisclosure(): PromoDisclosure {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (readDecision() === "dismissed") return;

        // Only pop once per browsing session.
        try {
            if (window.sessionStorage.getItem(SEEN_KEY)) return;
        } catch {
            /* ignore */
        }

        const timer = window.setTimeout(() => {
            setOpen(true);
            try {
                window.sessionStorage.setItem(SEEN_KEY, "1");
            } catch {
                /* ignore */
            }
            posthog.capture("uoftindex_promo_shown");
        }, REVEAL_DELAY);

        return () => window.clearTimeout(timer);
    }, []);

    const close = useCallback((decision: Decision, event: string) => {
        writeDecision(decision);
        posthog.capture(event);
        setOpen(false);
    }, []);

    return {
        open,
        remindLater: useCallback(() => close("remind", "uoftindex_promo_remind"), [close]),
        dismissForever: useCallback(() => close("dismissed", "uoftindex_promo_dismissed"), [close]),
        convert: useCallback(() => close("dismissed", "uoftindex_promo_clicked"), [close]),
    };
}

export const UOFTINDEX_URL =
    "https://uoftindex.com/?utm_source=uoftwebring&utm_medium=banner&utm_campaign=cross_promo";
