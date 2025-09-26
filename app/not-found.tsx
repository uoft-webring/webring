import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center">
            <div className="absolute -top-32 -left-32 h-[40rem] w-[40rem] animate-pulse rounded-full bg-gradient-to-r from-fuchsia-500 via-sky-400 to-violet-600 opacity-20 blur-3xl" />

            <div className="relative mb-6">
                <h1 className="relative z-10 animate-pulse bg-gradient-to-r from-sky-400 via-fuchsia-400 to-violet-500 bg-clip-text text-7xl font-black tracking-tight text-transparent select-none">
                    404
                </h1>
                <span className="absolute inset-0 -translate-x-1 translate-y-1 text-sky-400 opacity-50 blur-sm">
                    404
                </span>
                <span className="absolute inset-0 translate-x-1 -translate-y-1 text-fuchsia-400 opacity-50 blur-sm">
                    404
                </span>
            </div>

            <p className="text-muted-foreground max-w-md text-lg">
                What&quot;s worse is… we couldn&quot;t even find the 404 page either{" "}
                <span className="inline-block animate-bounce">🤷‍♂️</span>
            </p>

            <div className="border-border bg-card/70 mt-8 transform rounded-2xl border p-6 shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:-rotate-1 hover:skew-x-1">
                <p className="text-muted-foreground text-sm">
                    Try retracing your steps, check the URL, or bribe the router with cookies.
                </p>
                <div className="mt-4 flex justify-center">
                    <Button asChild className="animate-pulse hover:animate-none" variant="default">
                        <Link href="/">Take me home</Link>
                    </Button>
                </div>
            </div>

            <Link
                href="/directory"
                className="text-muted-foreground hover:text-foreground mt-4 text-sm underline decoration-dotted underline-offset-4"
            >
                or peek at The Directory
            </Link>
        </div>
    );
}
