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

const User = z
    .object({
        email: z
            .string()
            .email({ message: "Please enter an email address." })
            .refine(
                (email) => email.toLowerCase().endsWith("@mail.utoronto.ca"),
                {
                    message: 'Please use an "@mail.utoronto.ca" email.',
                }
            ),
        id: z.string(),
        name: z.string(),
        tagline: z.string().max(255).nullable(),
        domain: z.string(),
        image_url: z.string().url().optional(),
        isVerified: z.boolean(),
        github_url: z.string().url().nullable(),
        tags: z.string().array().max(3).nullable(),
    })
    .nullable();

export type UserType = z.infer<typeof User>;
