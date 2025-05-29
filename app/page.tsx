"use client";

import { Suspense, useEffect, useState } from "react";
import Ring from "./homeComponents/Ring";
import Loading from "@/components/loading";
import { fetchProfilesForRing } from "./homeComponents/actions";
import { ClientRing } from "./homeComponents/ClientRing";

import useEmblaCarousel from "embla-carousel-react";
import ProfileCard from "@/components/profileCard";

export default function Home() {
    const [emblaRef] = useEmblaCarousel({ loop: true });
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetcher = async () => {
            const { data, error } = await fetchProfilesForRing();
            if (data) {
                setData([...data, ...data, ...data]);
            }
        };

        fetcher();
    }, []);
    // const { data, error } = await fetchProfilesForRing();
    // await new Promise((resolve) => setTimeout(resolve, 20000));

    return (
        <div className="overflow-clip">
            <div className="max-w-svw aspect-square md:aspect-video xl:aspect-[24/9] 2xl:aspect-[32/9] w-full flex items-center justify-center mb-8">
                <ClientRing />
            </div>
            <div className="px-4">
                <h2 className="max-w-[85rem] w-full mx-auto">Preview</h2>
                <div
                    className="embla max-w-[85rem] mx-auto overflow-clip"
                    ref={emblaRef}
                >
                    {data ? (
                        <div className="embla__container flex">
                            {data.map((item) => {
                                return (
                                    <ProfileCard
                                        userData={item}
                                        className="min-w-[24rem] mx-4"
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </div>
    );
}
