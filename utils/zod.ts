import { z } from "zod";
import { validateUrl } from "./zod-fetcher";

export const parseEmail = (email: any) => {
    const emailSchema = z
        .string()
        .email({ message: "Please enter an email address." })
        .refine((email) => email.toLowerCase().endsWith("@mail.utoronto.ca"), {
            message: 'Please use an "@mail.utoronto.ca" email.',
        });
    return emailSchema.safeParse(email);
};

export const parseName = (name: any) => {
    const nameSchema = z
        .string()
        .nonempty({ message: "Please enter your full name." });
    return nameSchema.safeParse(name);
};

export const parseDomain = (domain: any) => {
    const domainSchema = z
        .string()
        .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,}$/, {
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
    tagline: z
        .string()
        .max(255, { message: "Tagline can not be longer than 255 characters." })
        .nullable(),
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
        .refine(validateUrl, { message: "Please enter a live URL." }),
    image_url: z
        .string()
        .url({ message: "Please enter a valid URL." })
        .or(z.literal("")),
    is_verified: z.boolean(),
    github_url: z
        .string()
        .refine(
            (val) => {
                // Check if the string is empty or starts with "https://github.com"
                return val === "" || /^https:\/\/github\.com\//.test(val);
            },
            {
                message: 'The URL must start with "https://github.com/".',
            }
        )
        .nullable(),
    tags: z
        .string()
        .nonempty()
        .array()
        .max(3, { message: "You can choose up to 3 tags." })
        .nullable(),
});

/* export const SafeUser = z.object({
    name: z.string().nonempty({ message: "Please enter a valid name." }),
    tagline: z
        .string()
        .max(255, { message: "Tagline can not be longer than 255 characters." })
        .nullable(),
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
        ),
    // .refine(validateUrl, { message: "Please enter a live URL." }),
    image_url: z
        .string()
        .url({ message: "Please enter a valid URL." })
        .or(z.literal("")),
    isVerified: z.boolean(),
    github_url: z
        .string()
        .refine(
            (val) => {
                // Check if the string is empty or starts with "https://github.com"
                return val === "" || /^https:\/\/github\.com\//.test(val);
            },
            {
                message: 'The URL must start with "https://github.com/".',
            }
        )
        .nullable(),
    tags: z
        .string()
        .nonempty()
        .array()
        .max(3, { message: "You can choose up to 3 tags." })
        .nullable(),
}); */

export type UserType = z.infer<typeof User>;
