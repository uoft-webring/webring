import { z } from "zod";
import { validateUrl } from "./zod-fetcher";

export const parseEmail = (email: any) => {
    const emailSchema = z
        .string()
        .email({ message: "Please enter an email address." })
        .transform((val) => val.toLowerCase())
        .refine(
            (email) =>
                email.toLowerCase().endsWith("@mail.utoronto.ca") ||
                email.toLowerCase().endsWith("@alum.utoronto.ca") ||
                email.toLowerCase().endsWith("@alumni.utoronto.ca"),
            {
                message: 'Please use an "@mail.utoronto.ca" email or an alumni email.',
            }
        );
    return emailSchema.safeParse(email);
};

export const parseName = (name: any) => {
    const nameSchema = z.string().nonempty({ message: "Please enter your full name." });
    return nameSchema.safeParse(name);
};

export const parseDomain = (domain: any) => {
    const domainSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,}$/, {
        message: "Please enter a valid domain.",
    }); // TODO: refine with blacklisted websites
    return domainSchema.safeParse(domain);
};

export const User = z.object({
    email: z
        .string()
        .email({ message: "Please enter an email address." })
        .refine((email) => email.toLowerCase().endsWith("@mail.utoronto.ca"), {
            message: 'Please use an "@mail.utoronto.ca" email.',
        }),
    ring_id: z.number().int().nonnegative(),
    id: z.string(),
    name: z.string().nonempty({ message: "Please enter a valid name." }),
    tagline: z.string().max(255, { message: "Bio can not be longer than 255 characters." }).nullable(),
    domain: z
        .string()
        .url({ message: "Please enter a valid URL." })
        .nonempty({ message: "Please enter a valid URL." })
        .refine(
            (value) => {
                try {
                    const url = new URL(value);
                    const forbiddenHosts = ["http", "https"];
                    // If the hostname is one of these forbidden words, reject it
                    return !forbiddenHosts.includes(url.hostname.toLowerCase());
                } catch {
                    return false;
                }
            },
            { message: "Invalid host format in URL." }
        )
        .refine(validateUrl, { message: "Please enter a live URL." }), // TODO: change to only fetch on save data
    image_key: z
        .string()
        .regex(/^[a-zA-Z0-9_-]+\.avif$/, {
            message: "Must be an .avif file.",
        })
        .or(z.literal("")),
    is_verified: z.boolean(),
    validated_user_component: z.string(),
    github_url: z.string().nullable(),
    tags: z.string().nonempty().array().max(3, { message: "You can choose up to 3 tags." }).nullable(),
    graduation_year: z
        .number({
            required_error: "Please enter your graduation year.",
            invalid_type_error: "Graduation year must be a number.",
        })
        .int({ message: "Graduation year must be an integer." })
        .min(1900, { message: "🤨" })
        .nullable(),
    program: z
        .string()
        .min(2, { message: "Program name must be at least 2 characters." })
        .max(60, { message: "Program name must be at most 60 characters." })
        .regex(/^[a-zA-Z0-9\s&(),.-]+$/, { message: "Program name contains invalid characters." })
        .nullable(),
    slug: z
        .string()
        .min(2, { message: "Slug must be at least 2 characters." })
        .max(50, { message: "Slug must be at most 30 characters." })
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
            message: "Slug can only contain lowercase letters, numbers, and hyphens.",
        })
        .refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
            message: "Slug cannot start or end with a hyphen.",
        }),
});

export const SafeUser = User.omit({
    email: true,
    id: true,
});

export type UserType = z.infer<typeof User>;
export type SafeUserType = z.infer<typeof SafeUser>;
