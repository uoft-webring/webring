"use server";
import { fetchProfilesForRing } from "./homeComponents/actions";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import ProfileCarousel from "./homeComponents/Carousel";
import RingSection from "./homeComponents/RingSection";
import { ScrollText } from "./homeComponents/scrollText";

export default async function Home() {
    const { data, error } = await fetchProfilesForRing();

    if (!data) {
        console.error("Error fetching profiles:", error);
        return <p>Error loading profiles.</p>;
    }

    return (
        <>
            <nav className="absolute top-0 left-[50%] translate-x-[-50%] max-w-[85rem] w-full px-6 py-4 flex justify-between items-center z-999">
                Logo
                <Link href={"/signup"}>
                    <Button>Sign up</Button>
                </Link>
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
                        "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
                        "Qui, pariatur repudiandae temporibus dolorum beatae distinctio at provident nostrum!",
                        "Dolor repudiandae quae veniam corrupti aut voluptate adipisci inventore ex, harum vero. Voluptas excepturi doloremque consequatur beatae repudiandae!",
                    ]}
                />
            </section>
            <section className="m-4 bg-card">
                <div className="p-6 w-full max-w-[85rem] mx-auto [&>*]:text-center flex flex-col items-center justify-center min-h-[60svh]">
                    <p className="mb-1 uppercase text-white/40 md:text-xl">
                        guess what
                    </p>
                    <h1 className="mb-6 text-2xl/8 md:text-3xl/8 lg:text-5xl/14">
                        Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit.
                    </h1>
                    <p className="mb-12 text-base text-white/80 md:text-xl lg:text-2xl">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Quod, voluptatum quas laboriosam doloremque aspernatur
                        modi nobis totam libero aut quaerat!
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
