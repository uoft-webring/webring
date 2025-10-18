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
        return <p>Error loading profiles.</p>;
    }

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={userData} />
            <div className="overflow-clip">
                <WebRing data={ringProfiles} />
                <div className="w-full px-4">
                    <div className="flex w-full flex-row items-center justify-center">
                        <h2 className="w-min text-center text-xl sm:text-3xl md:text-3xl lg:text-4xl">
                            Preview
                        </h2>
                        <h3>
                            <Link
                                href="/directory"
                                className="text-md text-primary ml-2 text-center hover:underline"
                            >
                                (or view the full directory)
                            </Link>
                        </h3>
                    </div>

                    <div className="mx-auto max-w-[85rem] items-center overflow-clip">
                        {ringProfiles ? <ProfileCarousel data={ringProfiles} /> : <p>No data</p>}
                    </div>
                </div>
            </div>

            <section className="mx-auto max-w-[85rem] py-12">
                <ScrollText
                    content={[
                        "We're bringing our digital portfolios together into a single, connected ecosystem.",
                        "Our purpose is to build a more connected and visible UofT community. We believe that by showcasing our work collectively, we create more opportunities for everyone.",
                        "This is our chance to strengthen our network, celebrate our skills, and build a lasting platform that elevates all of us, together.",
                    ]}
                />
            </section>
            {!userData && (
                <section className="bg-card m-4">
                    <div className="mx-auto flex min-h-[60svh] w-full max-w-[85rem] flex-col items-center justify-center p-6 [&>*]:text-center">
                        <p className="mb-1 text-white/40 uppercase md:text-xl">guess what</p>
                        <h1 className="mb-6 text-2xl/8 md:text-3xl/8 lg:text-5xl/14">
                            Getting yourself RING-ed up has never been easier!
                        </h1>
                        <p className="mb-12 text-base text-white/80 md:text-xl lg:text-2xl">
                            Get RING-ed up by signing up with your UofT email, entering your domain, and
                            adding the custom UofT Webring navigation component to your portfolio website!
                        </p>

                        <Link href="/signup">
                            <Button className="hidden h-12 px-6 text-lg font-semibold lg:block">
                                Join now!
                            </Button>
                            <Button className="lg:hidden">Join now!</Button>
                        </Link>
                    </div>
                </section>
            )}
            <section className="mx-auto flex min-h-[40svh] w-full max-w-[85rem] flex-col flex-wrap items-center justify-between gap-10 text-center md:flex-row md:gap-0">
                <div className="flex flex-1 flex-col items-center">
                    <h1 className="mb-6 text-2xl/8 md:text-2xl/8 lg:text-4xl/14">
                        Curious to Know Our Mission?
                    </h1>

                    <Link href="/manifesto">
                        <Button className="hidden h-12 text-lg font-semibold lg:block">
                            Read Our Manifesto
                        </Button>
                        <Button className="lg:hidden"> Read Our Manifesto</Button>
                    </Link>
                </div>

                <div className="flex flex-1 flex-col items-center">
                    <h1 className="mb-6 text-2xl/8 md:text-2xl/8 lg:text-4xl/14">
                        Check out The Webring Directory
                    </h1>
                    <Link href="/directory">
                        <Button className="hidden h-12 px-6 text-lg font-semibold lg:block">
                            Go to The Directory!
                        </Button>
                        <Button className="lg:hidden">Go to The Directory!</Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
