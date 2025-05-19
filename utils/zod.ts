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
