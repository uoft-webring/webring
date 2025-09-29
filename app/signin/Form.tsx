"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseEmail } from "@/utils/zod";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { signInAction } from "./actions";
import { useRouter } from "next/navigation";
export default function SigninForm() {
    const router = useRouter();
    const [emailError, setEmailError] = useState<string | undefined>(undefined);
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsFormDisabled(true);

        if (emailRef.current) {
            const email = emailRef.current.value.trim().toLowerCase();
            const emailParseResult = parseEmail(email);
            // Parsing success or faliure
            if (emailParseResult.success) {
                const { error } = await signInAction(email);
                if (error) {
                    setEmailError("Email not registered");
                } else {
                    router.push(`/auth/confirm?email=${email}`);
                }
            } else {
                setEmailError(emailParseResult.error!.message || "");
            }
        }
        setIsFormDisabled(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        name="email"
                        ref={emailRef}
                        type="text"
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
                New to the ring?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                    Sign up here.
                </Link>
            </div>
        </form>
    );
}
