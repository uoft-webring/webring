import React, { Suspense } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";
import logo from "@/public/logo.png";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { getAuthUserProfile } from "@/app/actions";

// The data array for footer links has been removed.

function Logo() {
    return (
        <Link href="/">
            <Image src={logo.src} alt="Logo" height={200} width={200} />
        </Link>
    );
}

export default async function Footer() {
    return (
        <footer className="text-gray-700 dark:text-gray-300">
            <div className="mx-auto max-w-[85rem] px-6 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
                    {/* Branding Section - Now takes up 3 columns on medium screens and up */}
                    <div className="flex flex-col items-start md:col-span-3">
                        <div className="flex w-full max-w-md items-center justify-between gap-4">
                            <Logo />
                            <div className="bg-secondary/40 flex items-center justify-center gap-2 rounded-full px-2.5 py-1.5">
                                <Link
                                    href="https://uoftwebring.com/redirect?nav=prev&id=0"
                                    aria-label="Previous Site"
                                >
                                    <ArrowLeftIcon />
                                </Link>
                                <div className="bg-muted-foreground/10 h-5 w-[1px]"></div>
                                <Link
                                    href="https://uoftwebring.com/redirect?nav=next&id=0"
                                    aria-label="Next Site"
                                >
                                    <ArrowRightIcon />
                                </Link>
                            </div>
                        </div>
                        {/* Added paragraph text below the logo */}
                        <p className="mt-4 max-w-md text-base text-gray-600 dark:text-gray-400">
                            The UofT Webring is a community of University of Toronto student websites, and
                            ultimately a movement to build more than just a resume.
                        </p>
                    </div>

                    {/* Desktop: Multi-column Layout - Hard-coded */}
                    <div className="hidden md:col-span-2 md:grid md:grid-cols-2 md:gap-8">
                        {/* Profile Section */}
                        <div>
                            <h4 className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
                                Profile
                            </h4>
                            <ul className="mt-4 space-y-3">
                                <li>
                                    <Link
                                        href="/dashboard"
                                        className="dark:text-muted-foreground text-base text-gray-600 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <Suspense fallback={null}>{profileLink()}</Suspense>
                            </ul>
                        </div>
                        {/* Learn more Section */}
                        <div>
                            <h4 className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
                                Learn more
                            </h4>
                            <ul className="mt-4 space-y-3">
                                <li>
                                    <Link
                                        href="/manifesto"
                                        className="dark:text-muted-foreground text-base text-gray-600 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        Manifesto
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/directory"
                                        className="dark:text-muted-foreground text-base text-gray-600 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        The Directory
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Mobile: Accordion Layout - Hard-coded */}
                    <div className="md:hidden">
                        <Accordion type="single" collapsible className="w-full">
                            {/* Profile Section */}
                            <AccordionItem value="Profile">
                                <AccordionTrigger className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
                                    Profile
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-3 pt-2">
                                        <li>
                                            <Link
                                                href="/dashboard"
                                                className="text-base text-gray-600 dark:text-gray-400"
                                            >
                                                Dashboard
                                            </Link>
                                        </li>
                                        <Suspense fallback={null}>{profileLink()}</Suspense>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            {/* Learn more Section */}
                            <AccordionItem value="Learn more">
                                <AccordionTrigger className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
                                    Learn more
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-3 pt-2">
                                        <li>
                                            <Link
                                                href="/manifesto"
                                                className="text-base text-gray-600 dark:text-gray-400"
                                            >
                                                Manifesto
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/directory"
                                                className="text-base text-gray-600 dark:text-gray-400"
                                            >
                                                The Directory
                                            </Link>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="border-border mt-12 -mb-6 flex flex-col border-t pt-4 text-sm md:flex-row md:items-center md:justify-between">
                    <p className="w-full text-center text-sm leading-6 text-gray-500 md:text-left xl:text-center dark:text-gray-400">
                        Copyright © 2025 The UofT Webring. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

const profileLink = async () => {
    const { data: userData, error } = await getAuthUserProfile();

    if (!userData?.slug || error) {
        return null;
    }

    return (
        <li>
            <Link
                href={`/u/${userData.slug}`}
                className="dark:text-muted-foreground text-base text-gray-600 hover:text-gray-900 dark:hover:text-white"
            >
                Profile
            </Link>
        </li>
    );
};
