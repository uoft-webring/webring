import { SITE_ORIGIN } from "@/lib/site";

export const LOGO_FORMATS = ["SVG", "PNG"] as const;
export type LogoFormat = (typeof LOGO_FORMATS)[number];

export const LOGO_COLORS = {
    Blue: "ring_logo",
    Black: "ring_logo_black",
    White: "ring_logo_white",
} as const;
export type LogoColor = keyof typeof LOGO_COLORS;

export type Snippet = { label: string; code: string; html: string };

/** The prev/next widget members paste into their site. Links must keep the /redirect?nav=&id= shape. */
export function widgetSnippets(ringId: number, format: LogoFormat, color: LogoColor): { label: string; code: string }[] {
    const logo = `${SITE_ORIGIN}/${LOGO_COLORS[color]}.${format.toLowerCase()}`;
    const prev = `${SITE_ORIGIN}/redirect?nav=prev&id=${ringId}`;
    const next = `${SITE_ORIGIN}/redirect?nav=next&id=${ringId}`;

    return [
        {
            label: "HTML & CSS",
            code: `<div style="display: flex; align-items: center; gap: 8px">
    <a href="${prev}" aria-label="Previous site in UofT Webring">←</a>
    <a href="${SITE_ORIGIN}" target="_blank">
        <img src="${logo}" alt="UofT Webring" style="width: 24px; height: auto" />
    </a>
    <a href="${next}" aria-label="Next site in UofT Webring">→</a>
</div>`,
        },
        {
            label: "React & Tailwind",
            code: `<div className="flex items-center gap-2">
    <a href="${prev}" aria-label="Previous site in UofT Webring">←</a>
    <a href="${SITE_ORIGIN}" target="_blank">
        <img src="${logo}" alt="UofT Webring" className="w-6 h-auto" />
    </a>
    <a href="${next}" aria-label="Next site in UofT Webring">→</a>
</div>`,
        },
    ];
}
