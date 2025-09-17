import Navbar from "@/components/Navbar";
import { getAuthUserProfile } from "../actions";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manifesto - UofT Webring",
    metadataBase: new URL("https://uoftwebring.com/manifesto"),
    description: "Explore the UofT Webring community manifesto.",
    keywords: ["UofT Webring", "Manifesto", "University of Toronto", "Student Profiles"],
    openGraph: {
        title: "UofT Webring Manifesto",
        type: "website",
        siteName: "UofT Webring",
        description: "Explore the UofT Webring community Manifesto.",
        url: "https://uoftwebring.com/manifesto",
    },
    twitter: {
        card: "summary_large_image",
        title: "UofT Webring Manifesto",
        description: "Explore the UofT Webring community manifesto.",
    },
    referrer: "origin-when-cross-origin",
    alternates: {
        canonical: "/manifesto",
    },
};

export default async function ManifestoLayout({ children }: { children: React.ReactNode }) {
    const { data: userData } = await getAuthUserProfile();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar user={userData} />
            {children}
        </div>
    );
}
