"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { verifyToken, resendOtp } from "../app/auth/confirm/actions";
import CardForm from "@/components/CardForm";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuthError } from "@supabase/supabase-js";

export default function OtpForm({ email }: { email: string }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [isPending, startTransition] = useTransition();
    const [cooldown, setCooldown] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // autofocus on load
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    });

    const handleSubmit = (entered?: string) => {
        const value = (entered ?? code).trim();
        if (value.length !== 6) return;

        startTransition(async () => {
            try {
                // Verify token either redirects or throws an error
                // We expect an error to be thrown otherwise we get nothing
                const error: AuthError = await verifyToken(email, value);
                setError(error.message);
            } finally {
                setCode("");
                inputRef.current?.focus();
            }
        });
    };
    const onChange = (v: string) => {
        if (error) setError(undefined);
        setCode(v);
        if (v.length === 6) handleSubmit(v);
    };

    const onResend = async () => {
        setError(undefined);
        await resendOtp(email);
        setCooldown(120); // 120 ms
        inputRef.current?.focus();
    };
    return (
        <CardForm
            cardTitle="Verify OTP"
            cardDescription={`Enter the 6-digit code we sent to ${email}.\nYour email may take some time to arrive.`}
        >
            <div>
                <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={onChange}
                    className="mx-auto"
                    ref={inputRef}
                    disabled={isPending}
                    error={error}
                >
                    <InputOTPGroup className="mx-auto">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>

                <div className="flex mt-4 gap-4">
                    <div className="flex-1">
                        <Link href="/signin" className="block">
                            <Button variant="outline" className="w-full" disabled={isPending}>
                                Back
                            </Button>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <Button
                            className="w-full"
                            onClick={onResend}
                            disabled={cooldown > 0 || isPending}
                            aria-live="polite"
                        >
                            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                        </Button>
                    </div>
                </div>
            </div>
        </CardForm>
    );
}
