import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Redirecting() {
    return (
        <div className="bg-background text-foreground relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center">
            {/* Background gradient blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-[40rem] w-[40rem] animate-pulse rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 opacity-20 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-40 h-[30rem] w-[30rem] animate-pulse rounded-full bg-gradient-to-br from-blue-600 via-emerald-500 to-cyan-400 opacity-20 blur-3xl [animation-delay:400ms]" />

            {/* Overlay pattern */}
            <div className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(transparent_0_3px,rgba(255,255,255,0.35)_4px_4.5px)] opacity-[0.05] mix-blend-overlay" />

            {/* Big redirect text */}
            <div className="relative mb-6">
                <h1 className="relative z-10 animate-pulse bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-500 bg-clip-text text-6xl font-black tracking-tight text-transparent select-none">
                    Redirecting…
                </h1>
                <span className="pointer-events-none absolute inset-0 -translate-x-1 translate-y-1 text-blue-400 opacity-50 blur-sm">
                    Redirecting…
                </span>
                <span className="pointer-events-none absolute inset-0 translate-x-1 -translate-y-1 text-emerald-400 opacity-50 blur-sm">
                    Redirecting…
                </span>
            </div>

            {/* Fun message */}
            <p className="text-muted-foreground max-w-md text-lg">
                Hold tight while we bend the space-time continuum{" "}
                <span className="animate-spin-slow inline-block">🌀</span>
            </p>

            {/* Progress bar */}
            <div className="mt-6 h-[3px] w-64 animate-pulse rounded-full bg-gradient-to-r from-emerald-500 via-blue-400 to-cyan-500" />

            {/* Card with info */}
            <div className="group relative mt-8 w-full max-w-md">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 via-emerald-500 to-cyan-400 opacity-60 blur transition-all duration-500 group-hover:opacity-90" />
                <div className="border-border bg-card/70 relative rounded-2xl border p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:-rotate-1 hover:skew-x-1">
                    <p className="text-muted-foreground text-sm">
                        If you’re not redirected in a few seconds, click below to speed things up.
                    </p>
                    <div className="mt-5 flex justify-center">
                        <div className="relative">
                            <span className="pointer-events-none absolute -inset-2 animate-pulse rounded-full bg-emerald-500/40 blur-md" />
                            <span className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-500/20" />
                            <Button asChild className="relative animate-pulse hover:animate-none">
                                <Link href="/">Take me there now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corner tags */}
            <div className="pointer-events-none absolute top-10 left-10 hidden gap-2 select-none md:flex">
                <span className="border-border bg-card/70 text-muted-foreground rotate-[-6deg] rounded-full border px-3 py-1 text-xs shadow-sm backdrop-blur-md">
                    stand by
                </span>
                <span className="border-border bg-card/70 text-muted-foreground animate-pulse rounded-full border px-3 py-1 text-xs shadow-sm backdrop-blur-md">
                    redirecting now...{" "}
                </span>
            </div>
            <div className="pointer-events-none absolute right-8 bottom-8 hidden select-none md:block">
                <span className="border-border bg-card/70 text-muted-foreground rotate-3 rounded-xl border px-3 py-1 text-xs shadow-sm backdrop-blur-md">
                    destination locked
                </span>
            </div>
        </div>
    );
}
