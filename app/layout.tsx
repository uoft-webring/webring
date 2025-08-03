import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const oxanium = Oxanium({
    variable: "--font-oxanium",
    subsets: ["latin"],
});

const description =
    "Join the UofT Webring to connect with other University of Toronto students and showcase your personal website.";

export const metadata: Metadata = {
    metadataBase: new URL("https://uoftwebring.com"),
    title: "UofT Webring",
    description,
    keywords: [
        "UofT Webring",
        "University of Toronto",
        "Webring",
        "Student Community",
    ],
    /* OG and Twitter Images are auto-added by Next.js */
    openGraph: {
        title: "UofT Webring",
        type: "website",
        siteName: "UofT Webring",
        description,
        url: "https://uoftwebring.com",
    },
    twitter: {
        card: "summary_large_image",
        title: "UofT Webring",
        description,
    },
    // We are fine with robots indexing our site
    robots: {
        index: true,
        follow: true,
        nocache: false,
    },
    referrer: "origin-when-cross-origin",
    /* alternates: {
        canonical: "/",
    }, */
    authors: [
        {
            name: "Jonathan Zhu",
            url: "https://jonathanzhu.com",
        },
        {
            name: "Mohammad Anwar",
            url: "https://mohammadanwar.dev",
        },
        {
            name: "Aman Meherally",
            url: "https://amanmeherally.com/",
        },
        {
            name: "Mohamad Damaj",
            url: "https://mohamaddamaj.com",
        },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={oxanium.variable}>
            <body className="scroll-smooth dark antialiased">
                {children}
                <Toaster richColors />
            </body>
        </html>
    );
}
