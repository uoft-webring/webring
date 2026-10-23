import { z } from "zod";

// Must stay in sync with public.check_uoft_email() and the profile check constraints.
const UOFT_EMAIL = /^[^\s@]+@((mail|alum|alumni)\.)?utoronto\.ca$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GITHUB_USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
// Includes : / # ; used by entries in lib/data/programs.ts (e.g. "Computer Science: Software Engineering")
const PROGRAM = /^[a-zA-Z0-9\s&(),.:/#;-]+$/;
export const IMAGE_KEY = /^[A-Za-z0-9_-]+\.avif$/;

export const MAX_TAGLINE_LENGTH = 255;
export const MAX_TAGS = 3;

export const emailSchema = z
    .string({ error: "Please enter an email address." })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Please enter an email address." }))
    .refine((email) => UOFT_EMAIL.test(email), {
        error: "Please use an utoronto.ca email.",
    });

export const nameSchema = z
    .string({ error: "Please enter your full name." })
    .trim()
    .min(1, { error: "Please enter your full name." })
    .max(80, { error: "Name can be at most 80 characters." });

export const otpSchema = z.string().regex(/^\d{6}$/, { error: "Enter the 6-digit code." });

function httpUrl(value: string): URL | null {
    // Same shape the DB enforces: lowercase scheme, no whitespace anywhere
    if (!/^https?:\/\/\S+$/.test(value)) return null;
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url : null;
    } catch {
        return null;
    }
}

const domainSchema = z
    .string()
    .trim()
    .max(255, { error: "URL can be at most 255 characters." })
    .refine((value) => value === "" || httpUrl(value) !== null, { error: "Please enter a valid URL." })
    // `https://https` parses as a URL, so also require a dotted hostname
    .refine((value) => value === "" || httpUrl(value)?.hostname.includes(".") !== false, {
        error: "Invalid host format in URL.",
    });

/** Fields a member may edit. Verification state and ring position are server-owned. */
export const profileInputSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { error: "Please enter a valid name." })
        .max(80, { error: "Name can be at most 80 characters." }),
    domain: domainSchema,
    tagline: z
        .string()
        .max(MAX_TAGLINE_LENGTH, { error: `Bio can not be longer than ${MAX_TAGLINE_LENGTH} characters.` }),
    githubUsername: z
        .string()
        .trim()
        .refine((value) => value === "" || GITHUB_USERNAME.test(value), {
            error: "Enter a valid GitHub username.",
        }),
    imageKey: z.string().refine((value) => value === "" || IMAGE_KEY.test(value), {
        error: "Must be an .avif file.",
    }),
    tags: z
        .array(z.string().trim().min(1).max(40))
        .max(MAX_TAGS, { error: `You can choose up to ${MAX_TAGS} tags.` }),
    graduationYear: z
        .number({ error: "Graduation year must be a number." })
        .int({ error: "Graduation year must be an integer." })
        .min(1900, { error: "🤨" })
        .max(2100, { error: "🤨" })
        .nullable(),
    program: z
        .string()
        .trim()
        .min(2, { error: "Program name must be at least 2 characters." })
        .max(60, { error: "Program name must be at most 60 characters." })
        .regex(PROGRAM, { error: "Program name contains invalid characters." })
        .nullable(),
    // New accounts get a UUID slug (36 chars), hence the 40-char limit
    slug: z
        .string()
        .trim()
        .min(2, { error: "Slug must be at least 2 characters." })
        .max(40, { error: "Slug must be at most 40 characters." })
        .regex(SLUG, { error: "Slug can only contain lowercase letters, numbers, and hyphens." }),
    openToWork: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type ProfileField = keyof ProfileInput;
export type ProfileErrors = Partial<Record<ProfileField, string>>;

/** First error message per field, for inline form errors. */
export function fieldErrors(error: z.ZodError<ProfileInput>): ProfileErrors {
    const errors: ProfileErrors = {};
    for (const issue of error.issues) {
        const field = issue.path[0] as ProfileField | undefined;
        if (field && !errors[field]) errors[field] = issue.message;
    }
    return errors;
}
