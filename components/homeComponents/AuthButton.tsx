"use client";

import { getCurrentUser, signOutAction } from "../../app/dashboard/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react"; // Import useState and useEffect

export default function AuthButton() {
    // Make this function synchronous
    const [user, setUser] = useState<any>(null); // Use appropriate type for user
    const [loading, setLoading] = useState(true); // Add a loading state
    const [error, setError] = useState<any>(null); // State for error

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            const { user: fetchedUser, error: fetchedError } =
                await getCurrentUser();
            setUser(fetchedUser);
            setError(fetchedError);
            setLoading(false);
        }

        fetchUser();
    }, []); // Empty dependency array means this runs once on client mount

    if (loading) {
        return (
            <Button variant={"outline"} disabled>
                Loading...
            </Button>
        ); // Show loading state during client fetch
    }

    if (error) {
        console.error("Error fetching user in AuthButton:", error);
        return (
            <Button variant={"outline"} disabled>
                Error
            </Button>
        ); // Handle error state
    }

    if (user) {
        return (
            <Button variant={"outline"} onClick={signOutAction}>
                Sign out
            </Button>
        );
    } else {
        return (
            <Link href={"/signup"}>
                <Button>Sign up</Button>
            </Link>
        );
    }
}
