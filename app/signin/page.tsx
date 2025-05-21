"use client";
import CardForm from "@/components/cardForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { signInAction } from "./actions";
import Link from "next/link";
import { FormEvent, Ref, RefObject, useRef, useState } from "react";
import { parseEmail } from "@/utils/zod";
import { redirect } from "next/navigation";

export default function Signin() {
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
                    setEmailError("Email not registered");
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
        <CardForm cardTitle="Welcome back!">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <div className="grid gap-6">
                        <div className="grname gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                name="email"
                                ref={emailRef}
                                type="email"
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
        </CardForm>
    );
}
