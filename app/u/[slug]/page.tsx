"use server";
import { getUserProfile } from "@/app/actions";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";

/**
 * This page is experimental
 *
 */
export default async function User({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data, error } = await getUserProfile(slug);
    const mockUserProfile = {
        ring_id: 123,
        name: "Mock User",
        tagline: "This is a mock user profile",
        domain: "mohammadanwar.dev",
        valid: true,
        github_url: "mh-anwar",
        image_url: "https://avatars.githubusercontent.com/u/12345678?v=4",
        is_verified: true,
        validated_user_component: "disconnected",
        tags: ["web", "developer", "mock"],
        subdomain: slug,
        graduation_year: 2024,
        program: "Computer Science",
    };
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex flex-col md:flex-row max-w-[70rem] mx-auto w-full flex-1  place-items-start">
                <div className="max-w-[70rem] mx-auto w-full px-6 mt-12 sm:mt-6">
                    {mockUserProfile ? (
                        <ProfileCard user={mockUserProfile} />
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-center mt-6">
                                {error || "User not found"}
                            </h2>
                            <p className="text-center mt-4">
                                The user profile you are looking for does not exist or has been removed.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
