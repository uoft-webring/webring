import CardForm from "@/components/CardForm";
import SigninForm from "./Form";
import { getAuthUser } from "../dashboard/actions";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    metadataBase: new URL("https://uoftwebring.com/signin"),
    description: "Sign in to your UofT Webring account.",
    keywords: ["UofT Webring", "Sign In", "University of Toronto", "Student Community"],
    openGraph: {
        title: "Sign In - UofT Webring",
        type: "website",
        siteName: "UofT Webring",
        description: "Sign in to your UofT Webring account.",
        url: "https://uoftwebring.com/signin",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign In - UofT Webring",
        description: "Sign in to your UofT Webring account.",
    },
    referrer: "origin-when-cross-origin",
    alternates: {
        canonical: "/signin",
    },
};

export default async function Signin() {
    const { data: user } = await getAuthUser();

    if (user) {
        console.log("[Signin] User session exists at sign in");
        redirect("/dashboard/edit");
    }

    return (
        <CardForm cardTitle="Welcome back!">
            <SigninForm />
        </CardForm>
    );
}
