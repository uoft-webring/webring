"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";
import logo from "@/public/logo.png";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
// The 'div' import from 'three' seems unused and has been removed for cleanup.

// Data for the footer links, organized into sections
const footerSections = [
    {
        title: "Profile",
        links: [
            { text: "Dashboard", href: "/dashboard" },
            { text: "Profile", href: "/u/aman" },
        ],
    },
    {
        title: "Learn more",
        links: [
            { text: "Manifesto", href: "/manifesto" },
            { text: "The Directory", href: "/directory" },
        ],
    },
];

function Logo() {
    return (
        <Link href="/">
            <Image src={logo.src} alt="Logo" height={200} width={200} />
        </Link>
    );
}

export default function Footer() {
    return (
        <footer className="text-gray-700 dark:text-gray-300">
            <div className="mx-auto max-w-[85rem] px-6 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
                    {/* Branding Section - Now takes up 3 columns on medium screens and up */}
                    <div className="flex flex-col items-start md:col-span-3">
                        <div className="flex w-full max-w-md items-center justify-between gap-4">
                            <Logo />
                            <div className="bg-secondary/40 flex items-center justify-center gap-2 rounded-full px-2.5 py-1.5">
                                <Link href="https://uoftwebring.com/redirect?nav=prev&id=0">
                                    <ArrowLeftIcon />
                                </Link>
                                <div className="bg-muted-foreground/10 h-5 w-[1px]"></div>
                                <Link href="https://uoftwebring.com/redirect?nav=next&id=0">
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

                    {/* Desktop: Multi-column Layout - Now takes up the remaining 2 columns */}
                    {/* The overall grid is md:grid-cols-5. Branding is md:col-span-3. Links are in the remaining md:col-span-2. */}
                    <div className="hidden md:col-span-2 md:grid md:grid-cols-2 md:gap-8">
                        {footerSections.map((section) => (
                            <div key={section.title}>
                                <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
                                    {section.title}
                                </h3>
                                <ul className="mt-4 space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.text}>
                                            <Link
                                                href={link.href}
                                                className="dark:text-muted-foreground text-base text-gray-600 hover:text-gray-900 dark:hover:text-white"
                                            >
                                                {link.text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Mobile: Accordion Layout */}
                    {/* Using a grid-col-span-1 here is redundant as it's a single column layout on mobile, but keeping the md:hidden */}
                    <div className="md:hidden">
                        <Accordion type="single" collapsible className="w-full">
                            {footerSections.map((section) => (
                                <AccordionItem value={section.title} key={section.title}>
                                    <AccordionTrigger className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
                                        {section.title}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-3 pt-2">
                                            {section.links.map((link) => (
                                                <li key={link.text}>
                                                    <Link
                                                        href={link.href}
                                                        className="text-base text-gray-600 dark:text-gray-400"
                                                    >
                                                        {link.text}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="border-border mt-12 -mb-6 flex flex-col border-t pt-4 text-sm md:flex-row md:items-center md:justify-between">
                    <p className="w-full text-center text-sm leading-6 text-gray-500 md:text-left xl:text-center dark:text-gray-400">
                        Copyright © 2025 THe UofT Webring. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
