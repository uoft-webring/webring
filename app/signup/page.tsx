import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CardForm } from "@/components/CardForm";
import { Navbar } from "@/components/Navbar";
import { getViewerProfile } from "@/lib/auth";
import { SignupForm } from "./Form";

const description = "Sign up for a UofT Webring account to connect with the community.";

export const metadata: Metadata = {
    title: "Sign Up",
    description,
    keywords: ["UofT Webring", "Sign Up", "University of Toronto", "Student Community"],
    openGraph: {
        title: "Sign Up - UofT Webring",
        type: "website",
        siteName: "UofT Webring",
        description,
        url: "/signup",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign Up - UofT Webring",
        description,
    },
    alternates: {
        canonical: "/signup",
    },
};

export default async function SignUpPage() {
    // Check the profile, not just the session: requireOwnProfile sends profile-less sessions here
    if (await getViewerProfile()) redirect("/dashboard/edit");

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar authAction="signin" />
            <CardForm
                cardTitle="Welcome"
                cardDescription="Enter your full name and your email to join the community."
            >
                <SignupForm />
            </CardForm>
        </div>
    );
}
