import type { Accent } from "@/lib/validation";

/**
 * Page accent colours, named after Toronto transit lines. Mid-tone so the rail and rings read on
 * the dark card background.
 */
export const ACCENT_COLORS: Record<Accent, { label: string; color: string }> = {
    periwinkle: { label: "Periwinkle", color: "var(--primary)" },
    "line-1": { label: "Line 1 yellow", color: "#f8c300" },
    "line-2": { label: "Line 2 green", color: "#2fb36b" },
    "line-4": { label: "Line 4 purple", color: "#b65fa8" },
    streetcar: { label: "Streetcar red", color: "#e8493f" },
    lake: { label: "Lake blue", color: "#46a8e0" },
};
