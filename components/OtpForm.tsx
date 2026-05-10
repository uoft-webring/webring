"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import posthog from "posthog-js";
import { toast } from "sonner";
import { resendOtp, verifyOtp } from "@/app/auth/actions";
import { CardForm } from "@/components/CardForm";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm({ email }: { email: string }): React.JSX.Element {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();
    // A code was just sent to reach this page, so start in cooldown
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const submit = (value: string) => {
        startTransition(async () => {
            // Resolves only on failure: success redirects to the dashboard
            const result = await verifyOtp(value);
            if (result.error) {
                setError(result.error);
                setCode("");
                inputRef.current?.focus();
            }
        });
    };

    const onChange = (value: string) => {
        setError(undefined);
        setCode(value);
        if (value.length === OTP_LENGTH) submit(value);
    };

    const onResend = () => {
        startTransition(async () => {
            setError(undefined);
            const result = await resendOtp();
            if (result.error) {
                setError(result.error);
                return;
            }
            posthog.capture("otp_resent");
            toast.success("A new code is on its way.");
            setCooldown(RESEND_COOLDOWN_SECONDS);
            inputRef.current?.focus();
        });
    };

    return (
        <CardForm
            cardTitle="Verify OTP"
            cardDescription={`Enter the 6-digit code we sent to ${email}.\nYour email may take some time to arrive.`}
        >
            <InputOTP
                maxLength={OTP_LENGTH}
                value={code}
                onChange={onChange}
                className="mx-auto"
                ref={inputRef}
                disabled={isPending}
                error={error}
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="One-time code"
            >
                <InputOTPGroup className="mx-auto">
                    {Array.from({ length: OTP_LENGTH }, (_, index) => (
                        <InputOTPSlot key={index} index={index} />
                    ))}
                </InputOTPGroup>
            </InputOTP>

            <div className="mt-4 flex gap-4">
                <Button asChild variant="outline" className="flex-1" disabled={isPending}>
                    <Link href="/signin">Back</Link>
                </Button>
                <Button className="flex-1" onClick={onResend} disabled={cooldown > 0 || isPending}>
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                </Button>
            </div>
        </CardForm>
    );
}
