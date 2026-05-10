import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CardForm } from "@/components/CardForm";
import { Navbar } from "@/components/Navbar";
import { getViewerProfile } from "@/lib/auth";
import { SigninForm } from "./Form";

const description = "Sign in to your UofT Webring account.";

export const metadata: Metadata = {
    title: "Sign In",
    description,
    keywords: ["UofT Webring", "Sign In", "University of Toronto", "Student Community"],
    openGraph: {
        title: "Sign In - UofT Webring",
        type: "website",
        siteName: "UofT Webring",
        description,
        url: "/signin",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign In - UofT Webring",
        description,
    },
    alternates: {
        canonical: "/signin",
    },
};

export default async function SignInPage() {
    // Check the profile, not just the session: requireOwnProfile sends profile-less sessions here
    if (await getViewerProfile()) redirect("/dashboard/edit");

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar authAction="signup" />
            <CardForm cardTitle="Welcome back!">
                <SigninForm />
            </CardForm>
        </div>
    );
}
