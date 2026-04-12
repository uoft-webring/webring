"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseEmail, parseName } from "@/utils/zod";
import React, { FormEvent, useRef, useState } from "react";
import { signUpAction } from "./actions";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupForm() {
    const router = useRouter();
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    const [emailError, setEmailError] = useState<string | undefined>(undefined);

    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsFormDisabled(true);

        if (emailRef.current && nameRef.current) {
            const email = emailRef.current.value.trim().toLowerCase();
            const emailParseResult = parseEmail(email);

            const name = nameRef.current.value;
            const nameParseResult = parseName(name);

            // Parsing success or failure
            if (emailParseResult.success && nameParseResult.success) {
                try {
                    const { error } = await signUpAction(name, email);
                    if (error) {
                        setEmailError(typeof error === "string" ? error : "Email already registered.");
                        setIsFormDisabled(false);
                    } else {
                        // Keep disabled during navigation to prevent double-submit
                        router.push(`/auth/confirm?email=${email}`);
                    }
                } catch (err: any) {
                    const isNetwork =
                        err?.message?.includes("fetch") || err?.message?.includes("network");
                    console.error("Signup action failed:", err?.message, err);
                    setEmailError(
                        isNetwork
                            ? "Could not reach the server. Please reload and try again."
                            : "Something went wrong. Please try again."
                    );
                    setIsFormDisabled(false);
                }
            } else {
                setEmailError(emailParseResult?.error?.errors[0]?.message || "");
                setNameError(nameParseResult?.error?.errors[0]?.message || "");
                setIsFormDisabled(false);
            }
        } else {
            setIsFormDisabled(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        name="name"
                        type="text"
                        ref={nameRef}
                        placeholder="John Doe"
                        error={nameError}
                        disabled={isFormDisabled}
                        onChange={() => nameError && setNameError(undefined)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        name="email"
                        type="text"
                        ref={emailRef}
                        placeholder="your.email@mail.utoronto.ca"
                        error={emailError}
                        disabled={isFormDisabled}
                        onChange={() => emailError && setEmailError(undefined)}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isFormDisabled}>
                    Continue
                </Button>
            </div>

            <div className="text-center text-sm">
                Already ring-ed?{" "}
                <Link href="/signin" className="underline underline-offset-4">
                    Sign in instead.
                </Link>
            </div>
        </form>
    );
}
