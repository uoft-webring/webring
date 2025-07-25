export const dynamic = "force-dynamic";

import { fetchProfilesForRing } from "../components/homeComponents/actions";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import ProfileCarousel from "../components/homeComponents/Carousel";
import RingSection from "../components/homeComponents/RingSection";
import { ScrollText } from "../components/homeComponents/ScrollText";
import Logo from "@/components/Logo";
import { createClient } from "@/utils/supabase/server";
// import { Suspense } from "react";
// import AuthButton from "./homeComponents/authButton";

export default async function Home() {
    const { data, error } = await fetchProfilesForRing();

    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    const { data: image_data, error: fetchError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user?.id);

    const userData = image_data?.at(0);
    const fallbackSrc = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userData?.ring_id}&radius=50`;

    if (!data) {
        console.error("Error fetching profiles:", error);
        return <p>Error loading profiles.</p>;
    }

    return (
        <>
            <nav className="absolute top-0 left-[50%] translate-x-[-50%] max-w-[85rem] w-full px-6 py-4 flex justify-between items-center z-999">
                <Logo />
                {user ? (
                    <Link href="/dashboard">
                        <img
                            src={
                                !userData?.image_url
                                    ? fallbackSrc
                                    : userData?.image_url
                            }
                            className={`rounded-full w-14 aspect-square
                                "border-4 border-card outline-4 outline-white"
                            }`}
                            alt="Profile picture"
                        />
                    </Link>
                ) : (
                    <Link href={"/signup"}>
                        <Button>Sign up</Button>
                    </Link>
                )}
                {/* <Suspense fallback={<div>Loading...</div>}>
                    <AuthButton />
                </Suspense> */}
            </nav>
            <div className="overflow-clip">
                {/* Temp check for null data */}
                {data ? <RingSection data={data} /> : <></>}
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
