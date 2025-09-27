import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="bg-background text-foreground relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
            {/* Subtle background blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-gradient-to-r from-fuchsia-500 via-sky-400 to-violet-600 opacity-15 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-40 h-[25rem] w-[25rem] rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-400 opacity-15 blur-3xl" />

            {/* Noise / texture layer */}
            <div className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(transparent_0_2px,rgba(255,255,255,0.2)_3px_3.5px)] opacity-[0.04] mix-blend-overlay" />

            {/* 404 Heading */}
            <div className="relative mb-6">
                <h1 className="relative z-10 bg-gradient-to-r from-sky-400 via-fuchsia-400 to-violet-500 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent select-none">
                    404
                </h1>
                <span className="pointer-events-none absolute inset-0 translate-x-1 translate-y-1 text-black/30 blur-sm dark:text-white/20">
                    404
                </span>
            </div>

            {/* Message */}
            <p className="text-muted-foreground max-w-md text-lg">
                Oops… we couldn’t find that page <span className="inline-block">🤷‍♂️</span>
            </p>

            {/* Divider */}
            <div className="mt-6 h-[2px] w-40 rounded-full bg-gradient-to-r from-fuchsia-500 via-sky-400 to-violet-500 opacity-70" />

            {/* Card with suggestion */}
            <div className="group relative mt-8 w-full max-w-md">
                <div className="border-border bg-card/80 relative rounded-2xl border p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-[1.01] hover:-rotate-1">
                    <p className="text-muted-foreground text-sm">
                        Try retracing your steps, check the URL, or head back home.
                    </p>
                    <div className="mt-5 flex justify-center">
                        <Button asChild className="relative">
                            <Link href="/">Take me home</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Extra links */}
            <Link
                href="/directory"
                className="text-muted-foreground hover:text-foreground mt-6 text-sm underline decoration-dotted underline-offset-4"
            >
                or peek at The Directory
            </Link>
        </div>
    );
}
