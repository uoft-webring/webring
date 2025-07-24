export const dynamic = "force-dynamic";

import { fetchProfilesForRing } from "./homeComponents/actions";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import ProfileCarousel from "./homeComponents/Carousel";
import RingSection from "./homeComponents/RingSection";
import { ScrollText } from "./homeComponents/scrollText";
import Logo from "@/components/logo";
import { Suspense } from "react";
import AuthButton from "./homeComponents/authButton";

export default async function Home() {
    const { data, error } = await fetchProfilesForRing();

    if (!data) {
        console.error("Error fetching profiles:", error);
        return <p>Error loading profiles.</p>;
    }

    return (
        <>
            <nav className="absolute top-0 left-[50%] translate-x-[-50%] max-w-[85rem] w-full px-6 py-4 flex justify-between items-center z-999">
                <Logo />
                <Suspense fallback={<div>Loading...</div>}>
                    <AuthButton />
                </Suspense>
            </nav>
            <div className="overflow-clip">
                <RingSection data={data} />
                <div className="px-4">
                    <h2 className="max-w-[85rem] w-full mx-auto">Preview</h2>
                    <div className="max-w-[85rem] mx-auto overflow-clip">
                        {data ? (
                            <ProfileCarousel data={data} />
                        ) : (
                            <p>No data</p>
                        )}
                    </div>
                </div>
            </div>

            <section className="py-12 max-w-[85rem] mx-auto">
                <ScrollText
                    content={[
                        "We're bringing our digital portfolios together into a single, connected ecosystem.",
                        "Our purpose is to build a more connected and visible UofT CS community. We believe that by showcasing our work collectively, we create more opportunities for everyone.",
                        "This is our chance to strengthen our network, celebrate our skills, and build a lasting platform that elevates all of us, together.",
                    ]}
                />
            </section>
            <section className="m-4 bg-card">
                <div className="p-6 w-full max-w-[85rem] mx-auto [&>*]:text-center flex flex-col items-center justify-center min-h-[60svh]">
                    <p className="mb-1 uppercase text-white/40 md:text-xl">
                        guess what
                    </p>
                    <h1 className="mb-6 text-2xl/8 md:text-3xl/8 lg:text-5xl/14">
                        Getting yourself RING-ed up has never been easier!
                    </h1>
                    <p className="mb-12 text-base text-white/80 md:text-xl lg:text-2xl">
                        Get RING-ed up by signing up with your UofT email,
                        entering your domain, and adding the custom UofT Webring
                        navigation component to your portfolio website!
                    </p>
                    <Link href="/signup">
                        <Button className="hidden lg:block text-lg h-12 px-6 font-semibold">
                            Join now!
                        </Button>
                        <Button className="lg:hidden">Join now!</Button>
                    </Link>
                </div>
            </section>
            <footer className="max-w-[85rem] mx-auto w-full px-6 py-4 flex justify-between items-center">
                &copy; {new Date().getFullYear()} | UofT Webring
                <Link href={"https://github.com/uoft-webring/webring"}>
                    View on GitHub
                </Link>
            </footer>
        </>
    );
}
