"use server";

import { getAllUserProfiles } from "./actions";

import Link from "next/link";
import ProfileCarousel from "../components/homeComponents/Carousel";
import Navbar from "@/components/Navbar";

import { ScrollText } from "../components/homeComponents/ScrollText";
import { Button } from "@/components/ui/button";
import { getAuthUserProfile } from "./actions";
import { WebRing } from "@/components/Ring/WebRing";

export default async function Home() {
    const { data: ringProfiles, error: ringProfilesError } = await getAllUserProfiles();
    const { data: userData } = await getAuthUserProfile();

    if (!ringProfiles || ringProfilesError) {
        console.error("[Home] Error fetching profiles:", ringProfilesError);
        return <p>Error loading profiles.</p>;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar user={userData} />
            <div className="overflow-clip">
                <WebRing data={ringProfiles} />
                <div className="px-4 w-full">
                    <div className="w-full flex flex-row justify-center items-center">
                        <h2 className="w-min text-xl text-center sm:text-3xl md:text-3xl lg:text-4xl">
                            Preview
                        </h2>
                        <h3>
                            <Link
                                href="/directory"
                                className="text-md ml-2 text-center text-primary hover:underline"
                            >
                                (or view the full directory)
                            </Link>
                        </h3>
                    </div>

                    <div className="max-w-[85rem] mx-auto overflow-clip items-center">
                        {ringProfiles ? <ProfileCarousel data={ringProfiles} /> : <p>No data</p>}
                    </div>
                </div>
            </div>

            <section className="py-12 max-w-[85rem] mx-auto">
                <ScrollText
                    content={[
                        "We're bringing our digital portfolios together into a single, connected ecosystem.",
                        "Our purpose is to build a more connected and visible UofT community. We believe that by showcasing our work collectively, we create more opportunities for everyone.",
                        "This is our chance to strengthen our network, celebrate our skills, and build a lasting platform that elevates all of us, together.",
                    ]}
                />
            </section>
            {!userData && (
                <section className="m-4 bg-card">
                    <div className="p-6 w-full max-w-[85rem] mx-auto [&>*]:text-center flex flex-col items-center justify-center min-h-[60svh]">
                        <p className="mb-1 uppercase text-white/40 md:text-xl">guess what</p>
                        <h1 className="mb-6 text-2xl/8 md:text-3xl/8 lg:text-5xl/14">
                            Getting yourself RING-ed up has never been easier!
                        </h1>
                        <p className="mb-12 text-base text-white/80 md:text-xl lg:text-2xl">
                            Get RING-ed up by signing up with your UofT email, entering your domain, and
                            adding the custom UofT Webring navigation component to your portfolio website!
                        </p>

                        <Link href="/signup">
                            <Button className="hidden lg:block text-lg h-12 px-6 font-semibold">
                                Join now!
                            </Button>
                            <Button className="lg:hidden">Join now!</Button>
                        </Link>
                    </div>
                </section>
            )}
            <section className="py-16 w-full max-w-[85rem] mx-auto text-center flex flex-row flex-wrap items-center justify-between min-h-[40svh]">
                <div className="flex flex-col flex-1 items-center">
                    <h1 className="mb-6 text-2xl/8 md:text-3xl/8 lg:text-5xl/14">
                        Curious to Know Our Mission?
                    </h1>

                    <Link href="/manifesto">
                        <Button className="hidden lg:block text-lg h-12  font-semibold">
                            Read Our Manifesto
                        </Button>
                        <Button className="lg:hidden"> Read Our Manifesto</Button>
                    </Link>
                </div>

                <div className="flex flex-col flex-1 items-center">
                    <h1 className="mb-6 text-2xl/8 md:text-3xl/8 lg:text-5xl/14">
                        View The Directory of UofT Webring Members
                    </h1>
                    <Link href="/directory">
                        <Button className="hidden lg:block text-lg h-12 px-6 font-semibold">
                            Go to The Directory!
                        </Button>
                        <Button className="lg:hidden">Go to The Directory!</Button>
                    </Link>
                </div>
            </section>
            <footer className="max-w-[85rem] mx-auto w-full px-6 py-4 flex justify-between items-center">
                &copy; {new Date().getFullYear()} | UofT Webring
                <Link href="https://github.com/uoft-webring/webring">View on GitHub</Link>
            </footer>
        </div>
    );
}
