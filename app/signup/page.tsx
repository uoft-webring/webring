import CardForm from "@/components/CardForm";
import SignupForm from "./Form";
import { getAuthUser } from "../dashboard/actions";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
    metadataBase: new URL("https://uoftwebring.com/signup"),
    description: "Sign up for a UofT Webring account to connect with the community.",
    keywords: ["UofT Webring", "Sign Up", "University of Toronto", "Student Community"],
    openGraph: {
        title: "Sign Up - UofT Webring",
        type: "website",
        siteName: "UofT Webring",
        description: "Sign up for a UofT Webring account to connect with the community.",
        url: "https://uoftwebring.com/signup",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign Up - UofT Webring",
        description: "Sign up for a UofT Webring account to connect with the community.",
    },
    referrer: "origin-when-cross-origin",
    alternates: {
        canonical: "/signup",
    },
};
export default async function SignUp() {
    const { data: user } = await getAuthUser();

    if (user) {
        redirect("/dashboard/edit");
    }

    return (
        <CardForm
            cardTitle="Welcome"
            cardDescription="Enter your full name and your email to join the community."
        >
            <SignupForm />
        </CardForm>
    );
}
