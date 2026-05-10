"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import posthog from "posthog-js";
import { requestSignIn, type AuthFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SigninForm(): React.JSX.Element {
    const router = useRouter();
    const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
        async (prev, formData) => {
            try {
                return await requestSignIn(prev, formData);
            } catch {
                // The action never ran (offline, deploy in progress): keep the user on the form
                return { error: "Could not reach the server. Please reload and try again.", values: prev.values };
            }
        },
        { error: null }
    );

    useEffect(() => {
        if (!state.sent) return;
        posthog.capture("signin_submitted");
        router.push("/auth/confirm");
    }, [state, router]);

    return (
        <form action={formAction} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-6">
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
                        disabled={pending || state.sent}
                        required
                    />
                </div>

                {state.error && (
                    <p role="alert" className="text-destructive text-sm">
                        {state.error}
                    </p>
                )}
                <Button type="submit" className="w-full" disabled={pending || state.sent}>
                    {pending ? "Sending code..." : "Continue"}
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
