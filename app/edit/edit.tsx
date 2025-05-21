"use client";
import Navbar from "@/components/navbar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EditJoin from "./components/join";
import EditProfile from "./components/profile";
import { UserType } from "@/utils/zod";
import { redirect } from "next/navigation";

// Define the NAVIGATION object

export default function EditClient({ data }: { data: UserType }) {
    const [navigationStatus, setNavigationStatus] =
        useState<NavigationKey>("PROFILE");

    const NAVIGATION = {
        PROFILE: {
            index: 1,
            option: "profile",
            text: "Your profile",
            component: (
                <EditProfile
                    data={data}
                    prev={() => {
                        redirect("/dashboard");
                    }}
                    next={() => {
                        setNavigationStatus("JOIN");
                    }}
                />
            ),
        },
        JOIN: {
            index: 2,
            option: "join",
            text: "Join the community",
            component: (
                <EditJoin
                    prev={() => {
                        setNavigationStatus("PROFILE");
                    }}
                    next={() => {
                        setNavigationStatus("VERIFICATION");
                    }}
                />
            ),
        },
        VERIFICATION: {
            index: 3,
            option: "verification",
            text: "Verify your domain",
            component: <div />,
        },
    } as const;

    type Navigation = typeof NAVIGATION;
    type NavigationKey = keyof Navigation; // 'PROFILE' | 'JOIN' | 'VERIFICATION'

    // Extract the keys as a tuple for type-safe runtime use
    const navigationKeys = Object.keys(NAVIGATION) as NavigationKey[];

    return (
        <>
            <Navbar />

            <div className="section">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full mb-4">
                            {NAVIGATION[navigationStatus].text}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup
                            value={navigationStatus}
                            onValueChange={(value) => {
                                if (
                                    navigationKeys.includes(
                                        value as NavigationKey
                                    )
                                ) {
                                    setNavigationStatus(value as NavigationKey);
                                }
                            }}
                        >
                            {navigationKeys.map((key) => (
                                <DropdownMenuRadioItem key={key} value={key}>
                                    {NAVIGATION[key].text}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                {NAVIGATION[navigationStatus].component}
            </div>
        </>
    );
}
