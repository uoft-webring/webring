/** Where a click to UofT Index came from, so each placement shows up separately in its analytics. */
export type UoftIndexPlacement = "banner" | "navbar" | "footer";

/** Link to UofT Index tagged with the placement (utm_medium), for cross-promo attribution. */
export function uoftIndexUrl(placement: UoftIndexPlacement): string {
    return `https://uoftindex.com/?utm_source=uoftwebring&utm_medium=${placement}&utm_campaign=cross_promo`;
}
