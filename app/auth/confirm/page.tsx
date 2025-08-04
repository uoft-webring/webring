"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { verifyToken, resendMagicLink, canLoadPage } from "./actions";
import CardForm from "@/components/CardForm";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useInputFocus from "@/hooks/useFocus";
import { AuthApiError } from "@supabase/supabase-js";

// TODO:
// - add loading state
export default function Confirm() {
    const searchParams = useSearchParams();
    const email = searchParams?.get("email")?.toString() || "";
    const [token, setToken] = useState("");
    const [loadPage, setLoadPage] = useState(true);
    const [value, setValue] = useState("");
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const { focusRef, setFocus } = useInputFocus();

    useEffect(() => {
        setFocus();
    });

    useEffect(() => {
        if (!email) {
            setLoadPage(false);
        }
        async function checkCanLoadPage() {
            setLoadPage(await canLoadPage(email));
        }
        checkCanLoadPage();
    }, [email]);

    useEffect(() => {
        const verifyLoader = async () => {
            if (value.length === 6) {
                setDisabled(true);
                const response = await verifyToken(email, value);
                setValue("");
                setDisabled(false);
                setError(
                    response.code === AuthApiError.name
                        ? "Invalid or expired token entered."
                        : response.message
                );
            }
        };

        verifyLoader();
    }, [value]);

    return loadPage ? (
        // TODO: handle verifyToken and form states for all 3 / 4 forms ok good night don't let Anwar bite
        // TODO: Error state for invalid OTP
        <CardForm
            cardTitle="Verify OTP"
            cardDescription={`Enter the OTP we sent to ${email}.\nYour email may take some time to arrive.`}
        >
            <div>
                <InputOTP
                    maxLength={6}
                    value={value}
                    onChange={(value) => {
                        setValue(value);
                        if (error) {
                            setError(undefined);
                        }
                    }}
                    className="mx-auto"
                    ref={focusRef}
                    disabled={disabled}
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

                {/*  [&>*]:basis-0 [&>*]:grow [&_Button]:w-full */}
                <div className="flex mt-6 gap-4">
                    <div className="flex-1">
                        <Link href="/signin">
                            <Button variant="outline" className="w-full">
                                Back
                            </Button>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <Button
                            className="w-full"
                            onClick={() => {
                                resendMagicLink(email);
                            }}
                        >
                            Resend
                        </Button>
                    </div>
                </div>
                {/* <div className="flex mt-6 gap-4">
                    <Link href={"/signin"} className="flex-1">
                        <Button variant={"outline"}>Back</Button>
                    </Link>
                    <Button
                        className="flex-1 gap-0"
                        onClick={() => {
                            resendMagicLink(email);
                        }}
                    >
                        Resend
                    </Button>
                </div> */}
            </div>
        </CardForm>
    ) : (
        <div>
            <h1> page doesnt seem to load</h1>
        </div>
    );
}
