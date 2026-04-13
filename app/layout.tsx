import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import "prismjs/themes/prism-tomorrow.css"; //find solution to this blocking thread
import Footer from "@/components/Footer";
import PosthogIdentityProvider from "@/providers/PosthogIdentityProvider";

const oxanium = Oxanium({
    variable: "--font-oxanium",
    subsets: ["latin"],
    display: "swap",
});

const description =
    "Join the UofT Webring to connect with other University of Toronto students and showcase your personal website.";

export const metadata: Metadata = {
    metadataBase: new URL("https://uoftwebring.com"),
    title: "UofT Webring",
    description,
    keywords: ["UofT Webring", "University of Toronto", "Webring", "Student Community"],
    // OG and Twitter Images are auto-added by Next.js
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
    referrer: "origin-when-cross-origin",
    alternates: {
        canonical: "/",
    },
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
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                url: "https://uoftwebring.com/",
                name: "UofT Webring",
                description,
                potentialAction: {
                    "@type": "SearchAction",
                    target: {
                        "@type": "EntryPoint",
                        urlTemplate: "https://uoftwebring.com/directory?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                },
            },
            {
                "@type": "Organization",
                name: "UofT Webring",
                url: "https://uoftwebring.com/",
                description:
                    "A community of University of Toronto students showcasing their personal websites and connecting through a webring.",
                logo: {
                    "@type": "ImageObject",
                    url: "https://uoftwebring.com/logo.png",
                },
                sameAs: ["https://github.com/uoft-webring"],
                foundingDate: "2025",
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "Home",
                        item: "https://uoftwebring.com/",
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: "Directory",
                        item: "https://uoftwebring.com/directory",
                    },
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: "Manifesto",
                        item: "https://uoftwebring.com/manifesto",
                    },
                ],
            },
        ],
    };
    return (
        <html lang="en" className={oxanium.variable}>
            <head>
            </head>
            <body className="dark scroll-smooth antialiased">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                    }}
                />
                <PosthogIdentityProvider>{children}</PosthogIdentityProvider>
                <Footer />
                <Toaster richColors />
            </body>
        </html>
    );
}
