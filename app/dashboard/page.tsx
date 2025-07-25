export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import React from "react";
import { getCurrentUser, getUserInfo } from "@/app/dashboard/actions";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

import EditSection from "./edit/EditSection";
import JoinSection from "./join/JoinSection";
import VerifySection from "./verification/VerifySection";
import Link from "next/link";

type LowercaseGeneric<T extends object> = Lowercase<keyof T & string>;

export default async function Dashboard(props: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    // First, check if the user is authenticated
    const { user: authUser, error: authError } = await getCurrentUser();
    if (!authUser) {
        redirect("/signup");
    }

    const { data: userData, error: userError } = await getUserInfo();

    const linkMap = {
        edit: <EditSection />,
        join: <JoinSection id={userData.ring_id} />,
        verify: <VerifySection user={userData} />,
    };

    // Next, check the current active tab
    const searchParams = await props.searchParams;
    type TabTypes = LowercaseGeneric<typeof linkMap>;
    const activeTab = searchParams?.tab;
    console.log(activeTab);

    let targetTab: TabTypes = "edit";
    if (typeof activeTab === "string") {
        if (activeTab === "join") {
            targetTab = "join";
        } else if (activeTab === "verify") {
            targetTab = "verify";
        } else if (activeTab === "edit") {
            targetTab = "edit";
        }
    }

    return (
        <>
            <Navbar />
            {/* <ToastTrigger message="This is a message" messageType="error" /> */}
            <section className="max-w-[70rem] mx-auto w-full px-6 mt-8">
                <h1 className="mb-4">{`Welcome, ${authUser.user_metadata.name}.`}</h1>
            </section>

            <div
                className={cn(
                    "xl:hidden",
                    "max-w-[70rem] mx-auto w-full px-12 mt-6"
                )}
            >
                <ol className="max-w-[70rem] mx-auto flex justify-between relative text-sm text-inactive after:content-[''] after:block after:w-full after:h-[3px] after:bg-inactive after:absolute after:top-1/2 after:left-0 after:-translate-y-1/2 after:-z-10">
                    {Object.keys(linkMap).map((expansion) => {
                        const isActive = expansion.toLowerCase() === targetTab;
                        return (
                            <Link
                                href={`/dashboard?tab=${expansion.toLowerCase()}`}
                                key={expansion}
                            >
                                <li
                                    key={expansion}
                                    className={cn(
                                        "relative list-none cursor-pointer after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:transition-colors after:duration-200 after:ease-in-out",
                                        "hover:after:bg-inactive",
                                        {
                                            "after:bg-white": isActive,
                                            "after:bg-inactive": !isActive,
                                        }
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "absolute top-full left-1/2 -translate-x-1/2 mt-1 inline-block text-center w-[100px]",
                                            "transition-colors duration-200 ease-in-out",
                                            { "text-white": isActive }
                                        )}
                                    >
                                        {expansion.toUpperCase()}
                                    </span>
                                </li>
                            </Link>
                        );
                    })}
                </ol>
            </div>
            <div
                className={cn(
                    "hidden xl:block",
                    "lg:relative lg:max-w-[70rem] lg:mx-auto lg:w-full lg:px-6"
                )}
            >
                <ol
                    className={cn(
                        "flex lg:flex-col lg:justify-between lg:items-center relative text-sm text-inactive",
                        "after:content-[''] after:block after:h-[3px] after:bg-inactive after:absolute after:top-0 after:left-1/2 after:-z-10",
                        "lg:absolute lg:top-0 lg:left-0 -translate-x-[300%]",
                        "lg:h-[70vh]",
                        "border-r-3 border-r-inactive"
                    )}
                >
                    {Object.keys(linkMap).map((expansion) => {
                        const isActive = expansion.toLowerCase() === targetTab;
                        return (
                            <Link
                                href={`/dashboard?tab=${expansion.toLowerCase()}`}
                                key={expansion}
                                className="lg:inline w-2.25"
                            >
                                <li
                                    key={expansion}
                                    className={cn(
                                        "relative list-none cursor-pointer after:content-[''] after:block after:w-3 after:h-3 lg:after:h-5 lg:after:w-5",
                                        "after:rounded-full after:transition-colors after:duration-200 after:ease-in-out",
                                        {
                                            "after:bg-white": isActive,
                                            "after:bg-inactive": !isActive,
                                        }
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "absolute top-0 -translate-y-1/4 right-[200%] mt-1 inline-block text-right w-[100px]",
                                            "transition-colors duration-200 ease-in-out",
                                            { "text-white": isActive },
                                            "lg:text-xl lg:font-semibold"
                                        )}
                                    >
                                        {expansion.toUpperCase()}
                                    </span>
                                </li>
                            </Link>
                        );
                    })}
                </ol>
            </div>
            <div className="max-w-[70rem] mx-auto w-full px-6 mt-12">
                {linkMap[targetTab]}
            </div>
        </>
    );
}
