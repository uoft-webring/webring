"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseEmail } from "@/utils/zod";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { signInAction } from "./actions";
import { redirect } from "next/navigation";

export default function SigninForm() {
    const [emailError, setEmailError] = useState<string | undefined>(undefined);
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsFormDisabled(true);

        if (emailRef.current) {
            const email = emailRef.current.value;
            const emailParseResult = parseEmail(email);

            // Parsing success or faliure
            if (emailParseResult.success) {
                console.log("Success");
                const { error } = await signInAction(email);
                if (error) {
                    setEmailError(error?.message);
                } else {
                    redirect(`/auth/confirm?email=${email}`);
                }
            } else {
                setEmailError(emailParseResult.error!.errors[0].message || "");
            }
        }
        setIsFormDisabled(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            name="email"
                            ref={emailRef}
                            type="text"
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
                    New to the ring?{" "}
                    <Link
                        href="/signup"
                        className="underline underline-offset-4"
                    >
                        Sign up here.
                    </Link>
                </div>
            </div>
        </form>
    );
}
