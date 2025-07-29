export const dynamic = "force-dynamic";

import React from "react";
import { getCurrentUser, getUserInfo } from "@/app/dashboard/actions";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user: authUser, error: authError } = await getCurrentUser();
    if (!authUser) redirect("/signup");

    const { data: userData, error: userError } = await getUserInfo();

    const sections = ["edit", "join", "verify"] as const;

    if (authError || userError) {
        //TODO error handling
    }
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar user={authUser} imageData={userData.image_url} />

            <section className="max-w-[70rem] mx-auto w-full px-6 mt-8">
                <h1 className="mb-4">{`Welcome, ${authUser.user_metadata.name}.`}</h1>
            </section>

            {/* Mobile Navigation */}
            <div className="xl:hidden max-w-[70rem] mx-auto w-full px-12 mt-6">
                <ol className="flex justify-between relative text-sm text-inactive after:content-[''] after:block after:w-full after:h-[3px] after:bg-inactive after:absolute after:top-1/2 after:left-0 after:-translate-y-1/2 after:-z-10">
                    {sections.map((section) => (
                        <Link key={section} href={`/dashboard/${section}`}>
                            <li className="relative list-none cursor-pointer after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-inactive hover:after:bg-white">
                                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 inline-block text-center w-[100px] text-white">
                                    {section.toUpperCase()}
                                </span>
                            </li>
                        </Link>
                    ))}
                </ol>
            </div>

            {/* Desktop Sidebar Navigation */}
            <div className="hidden xl:block lg:relative lg:max-w-[70rem] lg:mx-auto lg:w-full lg:px-6">
                <ol className="flex lg:flex-col lg:justify-between lg:items-center relative text-sm text-inactive after:content-[''] after:block after:h-[3px] after:bg-inactive after:absolute after:top-0 after:left-1/2 after:-z-10 lg:absolute lg:top-0 lg:left-0 -translate-x-[300%] lg:h-[70vh] border-r-3 border-r-inactive">
                    {sections.map((section) => (
                        <Link
                            key={section}
                            href={`/dashboard/${section}`}
                            className="lg:inline w-2.25"
                        >
                            <li className="relative list-none cursor-pointer after:content-[''] after:block after:w-3 after:h-3 lg:after:h-5 lg:after:w-5 after:rounded-full after:bg-inactive hover:after:bg-white">
                                <span className="absolute top-0 -translate-y-1/4 right-[200%] mt-1 inline-block text-right w-[100px] text-white lg:text-xl lg:font-semibold">
                                    {section.toUpperCase()}
                                </span>
                            </li>
                        </Link>
                    ))}
                </ol>
            </div>

            <div className="max-w-[70rem] mx-auto w-full px-6 mt-12">
                {children}
            </div>
        </div>
    );
}
