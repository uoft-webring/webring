"use server";
import { getUserProfile } from "@/app/actions";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import { notFound } from "next/navigation";

/**
 * This page is experimental
 *
 */
export default async function User({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // We get the user profile from the database with the particular slug as their subdomain
    const { data, error } = await getUserProfile(slug);

    if (error || !data) {
        notFound();
    }
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex flex-col md:flex-row max-w-[70rem] mx-auto w-full flex-1  place-items-start">
                <div className="max-w-[70rem] mx-auto w-full px-6 mt-12 sm:mt-6">
                    <ProfileCard user={data} />
                </div>
            </div>
        </div>
    );
}
