"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { verifyToken, resendMagicLink, canLoadPage } from "./actions";

// TODO:
// - add loading state
export default function Confirm() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email")?.toString() || "";
    const [token, setToken] = useState("");
    const [loadPage, setLoadPage] = useState(true);

    useEffect(() => {
        if (!email) {
            setLoadPage(false);
        }
        async function checkCanLoadPage() {
            setLoadPage(await canLoadPage(email));
        }
        checkCanLoadPage();
    }, [email]);

    return loadPage ? (
        <div className="flex flex-col">
            <div>
                <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    maxLength={6}
                    className="border"
                />
            </div>
            <div>
                <button
                    className="border cursor-pointer"
                    onClick={() => {
                        verifyToken(email, token);
                    }}
                >
                    Enter
                </button>
                <button
                    className="border cursor-pointer"
                    onClick={() => {
                        resendMagicLink(email);
                    }}
                >
                    Resend
                </button>
            </div>
        </div>
    ) : (
        <div>
            <h1> page doesnt seem to load</h1>
        </div>
    );
}
