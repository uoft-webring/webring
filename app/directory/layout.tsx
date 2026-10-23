import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getViewerProfile } from "@/lib/auth";

const description =
    "Browse the personal websites and portfolios of University of Toronto students. Search by name, program, graduation year or interests.";

export const metadata: Metadata = {
    title: "The Directory",
    description,
    keywords: ["UofT Webring", "Directory", "University of Toronto", "Student Profiles"],
    openGraph: {
        title: "UofT Webring Directory",
        type: "website",
        siteName: "UofT Webring",
        description,
        url: "/directory",
    },
    twitter: {
        card: "summary_large_image",
        title: "UofT Webring Directory",
        description,
    },
    alternates: {
        canonical: "/directory",
    },
};

export default async function DirectoryLayout({ children }: { children: React.ReactNode }) {
    const viewer = await getViewerProfile();

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={viewer} />
            {children}
        </div>
    );
}
