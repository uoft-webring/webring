import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Redirecting() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-center text-foreground">
            {/* Background gradient blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 opacity-20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-blue-600 via-emerald-500 to-cyan-400 opacity-20 blur-3xl animate-pulse [animation-delay:400ms]" />

            {/* Overlay pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:repeating-linear-gradient(transparent_0_3px,rgba(255,255,255,0.35)_4px_4.5px)]" />

            {/* Big redirect text */}
            <div className="relative mb-6">
                <h1 className="relative z-10 select-none text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-500 bg-clip-text text-transparent animate-pulse">
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
            <p className="max-w-md text-lg text-muted-foreground">
                Hold tight while we bend the space-time continuum{" "}
                <span className="inline-block animate-spin-slow">🌀</span>
            </p>

            {/* Progress bar */}
            <div className="mt-6 h-[3px] w-64 rounded-full bg-gradient-to-r from-emerald-500 via-blue-400 to-cyan-500 animate-pulse" />

            {/* Card with info */}
            <div className="group relative mt-8 w-full max-w-md">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 via-emerald-500 to-cyan-400 opacity-60 blur transition-all duration-500 group-hover:opacity-90" />
                <div className="relative rounded-2xl border border-border bg-card/70 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-rotate-1 hover:scale-[1.02] hover:skew-x-1">
                    <p className="text-sm text-muted-foreground">
                        If you’re not redirected in a few seconds, click below to speed things up.
                    </p>
                    <div className="mt-5 flex justify-center">
                        <div className="relative">
                            <span className="pointer-events-none absolute -inset-2 rounded-full bg-emerald-500/40 blur-md animate-pulse" />
                            <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-emerald-500/20 animate-ping" />
                            <Button asChild className="relative animate-pulse hover:animate-none">
                                <Link href="/">Take me there now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corner tags */}
            <div className="pointer-events-none absolute left-10 top-10 hidden select-none gap-2 md:flex">
                <span className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md shadow-sm rotate-[-6deg]">
                    stand by
                </span>
                <span className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md shadow-sm animate-pulse">
                    redirecting now...{" "}
                </span>
            </div>
            <div className="pointer-events-none absolute right-8 bottom-8 hidden select-none md:block">
                <span className="rounded-xl border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md shadow-sm rotate-3">
                    destination locked
                </span>
            </div>
        </div>
    );
}
