import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getViewerProfile } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Manifesto",
    description: "Explore the UofT Webring community manifesto.",
    keywords: ["UofT Webring", "Manifesto", "University of Toronto", "Student Profiles"],
    openGraph: {
        title: "UofT Webring Manifesto",
        type: "website",
        siteName: "UofT Webring",
        description: "Explore the UofT Webring community Manifesto.",
        url: "/manifesto",
    },
    twitter: {
        card: "summary_large_image",
        title: "UofT Webring Manifesto",
        description: "Explore the UofT Webring community manifesto.",
    },
    alternates: {
        canonical: "/manifesto",
    },
};

export default async function ManifestoLayout({ children }: { children: React.ReactNode }) {
    const viewer = await getViewerProfile();

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={viewer} />
            {children}
        </div>
    );
}
