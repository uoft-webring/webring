"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseEmail, parseName } from "@/utils/zod";
import React, { FormEvent, useRef, useState } from "react";
import { signUpAction } from "./actions";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function SignupForm() {
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    const [emailError, setEmailError] = useState<string | undefined>(undefined);

    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsFormDisabled(true);

        if (emailRef.current && nameRef.current) {
            const email = emailRef.current.value;
            const emailParseResult = parseEmail(email);

            const name = nameRef.current.value;
            const nameParseResult = parseName(name);

            // Parsing success or faliure
            if (emailParseResult.success && nameParseResult.success) {
                console.log("Success");
                const { error } = await signUpAction(name, email);
                if (error) {
                    setEmailError(error?.message);
                } else {
                    redirect(`/auth/confirm?email=${email}`);
                }
                console.log("Finished");
            } else {
                setIsFormDisabled(false);
                setEmailError(
                    emailParseResult?.error?.errors[0]?.message || ""
                );
                setNameError(nameParseResult?.error?.errors[0]?.message || "");
            }
            setIsFormDisabled(false);
        }
        setIsFormDisabled(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            name="name"
                            type="text"
                            ref={nameRef}
                            placeholder="John Doe"
                            error={nameError}
                            disabled={isFormDisabled}
                            onChange={() => {
                                if (nameError) {
                                    setNameError(undefined);
                                }
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            name="email"
                            type="text"
                            ref={emailRef}
                            placeholder="your.email@mail.utoronto.ca"
                            error={emailError}
                            disabled={isFormDisabled}
                            onChange={() => {
                                if (emailError) {
                                    setEmailError(undefined);
                                }
                            }}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isFormDisabled}
                    >
                        Continue
                    </Button>
                </div>
                <div className="text-center text-sm">
                    Already ring-ed?{" "}
                    <Link
                        href="/signin"
                        className="underline underline-offset-4"
                    >
                        Sign in instead.
                    </Link>
                </div>
            </div>
        </form>
    );
}
