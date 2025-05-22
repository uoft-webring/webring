import { z } from "zod";

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

export const User = z.object({
    email: z
        .string()
        .email({ message: "Please enter an email address." })
        .refine((email) => email.toLowerCase().endsWith("@mail.utoronto.ca"), {
            message: 'Please use an "@mail.utoronto.ca" email.',
        }),
    id: z.string(),
    name: z.string().nonempty({ message: "Please enter a valid name." }),
    tagline: z
        .string()
        .max(255, { message: "Tagline can not be longer than 255 characters." })
        .nullable(),
    domain: z
        .string()
        .url({ message: "Please enter a valid URL." })
        .nonempty({ message: "Please enter a valid URL." }),
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
});

export type UserType = z.infer<typeof User>;
