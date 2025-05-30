"use client";

import { Suspense, useEffect, useState } from "react";
import Ring from "./homeComponents/Ring";
import Loading from "@/components/loading";
import { fetchProfilesForRing } from "./homeComponents/actions";
import { ClientRing } from "./homeComponents/ClientRing";

import useEmblaCarousel from "embla-carousel-react";
import ProfileCard from "@/components/profileCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
    const [emblaRef] = useEmblaCarousel({ loop: true });
    const [data, setData] = useState<any[]>([]);
    const [fullSize, setFullSize] = useState<boolean>(false);

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

    const toggleSize = () => {
        setFullSize((fullSize) => !fullSize);
    };

    return (
        <>
            <nav className="absolute top-0 left-[50%] translate-x-[-50%] max-w-[85rem] w-full border-4 px-6 py-4 flex justify-between items-center z-999">
                Logo
                <Link href={"/signup"}>
                    <Button>Sign up</Button>
                </Link>
            </nav>
            <div className="overflow-clip">
                <div
                    className={cn(
                        "relative max-w-svw w-full flex items-center justify-center mb-8 transition-all",
                        { "h-[calc(100svh-4rem)]": fullSize },
                        { "h-[calc(100svh-36rem)]": !fullSize }
                    )}
                >
                    <ClientRing />
                    <div className="absolute bottom-0 left-[50%] translate-x-[-50%] translate-y-[50%] max-w-[85rem] w-full p-4">
                        <Button
                            size={"icon"}
                            variant={"outline"}
                            onClick={toggleSize}
                        >
                            {fullSize ? (
                                <ChevronUp className="size-8" />
                            ) : (
                                <ChevronDown className="size-8" />
                            )}
                        </Button>
                    </div>
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
        </>
    );
}
