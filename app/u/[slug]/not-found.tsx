import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-center text-foreground">
            <div className="pointer-events-none absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-gradient-to-r from-fuchsia-500 via-sky-400 to-violet-600 opacity-20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-400 opacity-20 blur-3xl animate-pulse [animation-delay:400ms]" />

            <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:repeating-linear-gradient(transparent_0_3px,rgba(255,255,255,0.35)_4px_4.5px)]" />

            <div className="relative mb-6">
                <h1 className="relative z-10 select-none text-7xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-fuchsia-400 to-violet-500 bg-clip-text text-transparent animate-pulse">
                    404
                </h1>
                <span className="pointer-events-none absolute inset-0 -translate-x-1 translate-y-1 text-sky-400 opacity-50 blur-sm">
                    404
                </span>
                <span className="pointer-events-none absolute inset-0 translate-x-1 -translate-y-1 text-fuchsia-400 opacity-50 blur-sm">
                    404
                </span>
            </div>

            <p className="max-w-md text-lg text-muted-foreground">
                What&apos;s worse is… we have no clue who that is{" "}
                <span className="inline-block animate-bounce">🤷‍♂️</span>
            </p>

            <div className="mt-6 h-[3px] w-64 -skew-x-6 rounded-full bg-gradient-to-r from-fuchsia-500 via-sky-400 to-violet-500 opacity-70" />

            <div className="group relative mt-8 w-full max-w-md">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-400 opacity-60 blur transition-all duration-500 group-hover:opacity-90" />
                <div className="relative rounded-2xl border border-border bg-card/70 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-rotate-1 hover:scale-[1.02] hover:skew-x-1">
                    <p className="text-sm text-muted-foreground">
                        Try retracing your steps, check the URL, or bribe the router with cookies.
                    </p>
                    <div className="mt-5 flex justify-center">
                        <div className="relative">
                            <span className="pointer-events-none absolute -inset-2 rounded-full bg-fuchsia-500/40 blur-md animate-pulse" />
                            <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-fuchsia-500/20 animate-ping" />
                            <Button asChild className="relative animate-pulse hover:animate-none">
                                <Link href="/">Take me home</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute left-10 top-10 hidden select-none gap-2 md:flex">
                <span className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md shadow-sm rotate-[-6deg]">
                    route lost
                </span>
                <span className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md shadow-sm animate-pulse">
                    0x404
                </span>
            </div>
            <div className="pointer-events-none absolute right-8 bottom-8 hidden select-none md:block">
                <span className="rounded-xl border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md shadow-sm rotate-3">
                    try /directory
                </span>
            </div>

            <Link
                href="/directory"
                className="mt-4 text-sm text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
                or peek at The Directory
            </Link>
        </div>
    );
}
