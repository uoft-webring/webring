import Link from "next/link";
import { LazyCarousel } from "@/components/homeComponents/LazyCarousel";
import { ScrollText } from "@/components/homeComponents/ScrollText";
import { Navbar } from "@/components/Navbar";
import { LazyWebRing } from "@/components/Ring/LazyWebRing";
import { Button } from "@/components/ui/button";
import { getViewerProfile } from "@/lib/auth";
import { getPublicProfiles } from "@/lib/profiles/queries";
import { ringMembers } from "@/lib/profiles/ring";

function CtaButton({ href, children }: { href: string; children: React.ReactNode }): React.JSX.Element {
    return (
        <Button asChild className="lg:h-12 lg:px-6 lg:text-lg lg:font-semibold">
            <Link href={href}>{children}</Link>
        </Button>
    );
}

export default async function Home() {
    const [{ data: profiles, error }, viewer] = await Promise.all([getPublicProfiles(), getViewerProfile()]);

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={viewer} />
            <h1 className="sr-only">UofT Webring</h1>
            <div className="overflow-clip">
                {profiles && <LazyWebRing members={ringMembers(profiles)} />}
                <div className="w-full px-4">
                    <div className="flex w-full flex-row items-center justify-center">
                        <h2 className="w-min text-center text-xl sm:text-3xl md:text-3xl lg:text-4xl">Preview</h2>
                        <Link href="/directory" className="text-md text-primary ml-2 text-center hover:underline">
                            (or view the full directory)
                        </Link>
                    </div>

                    <div className="mx-auto max-w-[85rem] items-center overflow-clip">
                        {error !== null ? (
                            <p className="text-muted-foreground py-12 text-center">
                                We couldn&apos;t load the ring right now. Please refresh in a moment.
                            </p>
                        ) : profiles.length > 0 ? (
                            <LazyCarousel profiles={profiles} />
                        ) : (
                            <p className="text-muted-foreground py-12 text-center">No members yet. Be the first!</p>
                        )}
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
            {!viewer && (
                <section className="bg-card m-4 rounded-2xl">
                    <div className="mx-auto flex min-h-[40svh] w-full max-w-[85rem] flex-col items-center justify-center p-6 px-8 sm:px-16">
                        <p className="mb-1 text-center text-white/40 uppercase md:text-xl">guess what</p>
                        <h2 className="mb-6 text-center text-2xl/8 md:text-3xl/8 lg:text-5xl/14">
                            Getting yourself RING-ed up has never been easier!
                        </h2>
                        <p className="mb-12 max-w-3xl text-center text-base text-pretty text-white/80 md:text-xl lg:text-2xl">
                            Sign up with your UofT email, add your domain, and join the ring.
                        </p>
                        <CtaButton href="/signup">Join now!</CtaButton>
                    </div>
                </section>
            )}
            <section className="mx-auto flex min-h-[40svh] w-full max-w-[85rem] flex-col flex-wrap items-center justify-between gap-10 text-center md:flex-row md:gap-0">
                <div className="flex flex-1 flex-col items-center">
                    <h2 className="mb-6 text-2xl/8 md:text-2xl/8 lg:text-4xl/14">Curious to Know Our Mission?</h2>
                    <CtaButton href="/manifesto">Read Our Manifesto</CtaButton>
                </div>

                <div className="flex flex-1 flex-col items-center">
                    <h2 className="mb-6 text-2xl/8 md:text-2xl/8 lg:text-4xl/14">Check out The Directory</h2>
                    <CtaButton href="/directory">Go to The Directory!</CtaButton>
                </div>
            </section>
        </div>
    );
}
