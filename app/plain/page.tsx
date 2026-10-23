import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Halftone } from "@/components/plain/Halftone";
import { PlainRing } from "@/components/plain/PlainRing";
import type { PlainMember } from "@/components/plain/types";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { ringMembers } from "@/lib/profiles/ring";
import { displayDomain } from "@/lib/site";
import ringLogo from "@/public/ring_logo.svg";

// Scoped to this page: the main site keeps Oxanium
const serif = EB_Garamond({ subsets: ["latin"], variable: "--font-plain-serif", display: "swap" });
const mono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-plain-mono",
    display: "swap",
});

const description =
    "The UofT Webring in plain text: every University of Toronto student site in the ring, in one list.";

export const metadata: Metadata = {
    title: "UofT Webring (plain)",
    description,
    alternates: { canonical: "/plain" },
    openGraph: { title: "UofT Webring (plain)", description, url: "/plain" },
};

const linkClass = "text-[#006a8a] underline decoration-1 underline-offset-[3px] hover:text-[#1E3765]";

export default async function PlainPage() {
    const { data: profiles } = await getPublicProfiles();
    const members: PlainMember[] = ringMembers(profiles ?? []).map((profile) => ({
        ringId: profile.ringId,
        name: profile.name,
        year: profile.graduationYear,
        domain: profile.domain,
        label: displayDomain(profile.domain),
    }));

    const intro = (
        <>
            <header className="flex items-center gap-3">
                <Image src={ringLogo} alt="" width={44} height={44} priority />
                <h1 className="m-0 text-3xl leading-none font-normal text-[#1E3765]">
                    <span className="block text-[11px] leading-normal tracking-[0.2em] text-[#4a5a78] uppercase">
                        University of Toronto
                    </span>
                    Webring
                </h1>
            </header>

            <div className="mt-10 max-w-[46rem] space-y-4 text-[17px] leading-relaxed">
                <p>
                    Welcome to the UofT Webring, a ring of personal websites made by students at the{" "}
                    <a
                        href="https://www.utoronto.ca"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                    >
                        University of Toronto
                    </a>
                    . Every site links to the next one, so you can wander from portfolio to portfolio and see
                    what the people around you are building, writing and making.
                </p>
                <p>
                    Got a site of your own? Come{" "}
                    <Link href="/signup" className={linkClass}>
                        join the ring
                    </Link>{" "}
                    with your UofT email. Prefer things with more spin? There&apos;s a{" "}
                    <Link href="/" className={linkClass}>
                        3D version
                    </Link>{" "}
                    too.
                </p>
            </div>
        </>
    );

    // The root layout is dark and its base styles force <p> to 14px white text, so this wrapper
    // sets its own palette and lets paragraphs inherit from their container
    return (
        <div
            className={`${serif.variable} ${mono.variable} relative min-h-svh overflow-x-clip bg-[#f3f6fb] font-[family-name:var(--font-plain-serif)] text-[#14213d] [&_p]:[font-size:inherit] [&_p]:[line-height:inherit] [&_p]:[color:inherit]`}
        >
            <nav
                aria-label="About the webring"
                className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1 font-[family-name:var(--font-plain-mono)] text-xs italic sm:top-6 sm:right-6"
            >
                <Link href="/manifesto" className={`${linkClass} bg-[#f3f6fb]/80 px-1`}>
                    what&apos;s a webring?
                </Link>
                <Link href="/signup" className={`${linkClass} bg-[#f3f6fb]/80 px-1`}>
                    how can i join?
                </Link>
            </nav>

            <main className="mx-auto max-w-[110rem] px-4 pt-6 pb-20 sm:px-6">
                <PlainRing
                    members={members}
                    intro={intro}
                    decoration={<Halftone className="mb-6 hidden h-[300px] w-full lg:block" />}
                />
            </main>

            {/* Soft hand-off into the site's dark footer */}
            <div aria-hidden className="h-16 bg-gradient-to-b from-[#f3f6fb] to-transparent" />
        </div>
    );
}
