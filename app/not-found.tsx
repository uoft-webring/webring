import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    // This is to push the footer to the bottom of the screen
    return (
        <div className="relative flex h-svh flex-col items-center justify-center text-center">
            <h2 className="absolute top-1/2 left-1/2 -z-1 -translate-x-1/2 -translate-y-1/2 text-[40svw] tracking-wider text-white opacity-[5%] lg:text-[16rem]">
                404
            </h2>
            <div className="mx-6">
                <p className="text-muted-foreground/40 text-lg font-bold uppercase">PAGE NOT FOUND</p>
                <h1 className="mt-2">Faliure is the First Step to Success.</h1>
                <p className="text-muted-foreground/60 mt-8 text-sm">
                    Try retracing your steps, check the URL, or bribe the router with cookies. Alternatively,
                    view our manifesto to learn why we do what we do or head back home to start fresh.
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                    <Link href="/manifesto">
                        <Button size={"lg"} variant={"secondary"}>
                            Manifesto
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button size={"lg"}>Return home</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
