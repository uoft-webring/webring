import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Oxanium } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const oxanium = Oxanium({
    variable: "--font-oxanium",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "UofT Webring",
    description:
        "Join the UofT Webring to connect with other University of Toronto students and showcase your personal website.",
    openGraph: {
        title: "UofT Webring",
        description:
            "Join the UofT Webring to connect with other University of Toronto students and showcase your personal website.",
        url: "https://uoftwebring.com",
    },
    twitter: {
        card: "summary_large_image",
        title: "UofT Webring",
        description:
            "Join the UofT Webring to connect with other University of Toronto students and showcase your personal website.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${oxanium.variable} dark antialiased`}>
                {children}
                <Toaster richColors />
            </body>
        </html>
    );
}
