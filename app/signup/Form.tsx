"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import posthog from "posthog-js";
import { requestSignUp, type AuthFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm(): React.JSX.Element {
    const router = useRouter();
    const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
        async (prev, formData) => {
            try {
                return await requestSignUp(prev, formData);
            } catch {
                // The action never ran (offline, deploy in progress): keep the user on the form
                return { error: "Could not reach the server. Please reload and try again.", values: prev.values };
            }
        },
        { error: null }
    );

    useEffect(() => {
        if (!state.sent) return;
        posthog.capture("signup_submitted");
        router.push("/auth/confirm");
    }, [state, router]);

    const disabled = pending || state.sent;

    return (
        <form action={formAction} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="John Doe"
                        defaultValue={state.values?.name}
                        error={state.fieldErrors?.name}
                        disabled={disabled}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="your.email@mail.utoronto.ca"
                        defaultValue={state.values?.email}
                        error={state.fieldErrors?.email}
                        disabled={disabled}
                        required
                    />
                </div>

                {state.error && (
                    <p role="alert" className="text-destructive text-sm">
                        {state.error}
                    </p>
                )}
                <Button type="submit" className="w-full" disabled={disabled}>
                    {pending ? "Sending code..." : "Continue"}
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
