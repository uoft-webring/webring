import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Friendly full-page error. Never shows raw error details; always offers a way home. */
export function ErrorScreen({
    code,
    eyebrow,
    title,
    description,
    onRetry,
    secondaryLink,
}: {
    code: string;
    eyebrow: string;
    title: string;
    description: string;
    onRetry?: () => void;
    secondaryLink?: { href: string; label: string };
}): React.JSX.Element {
    return (
        <main className="relative flex min-h-svh flex-col items-center justify-center text-center">
            <p
                aria-hidden
                className="absolute top-1/2 left-1/2 -z-1 -translate-x-1/2 -translate-y-1/2 text-[40svw] font-semibold tracking-wider text-white opacity-[5%] lg:text-[16rem]"
            >
                {code}
            </p>
            <div className="mx-6 max-w-5xl">
                <p className="text-muted-foreground/40 text-lg font-bold uppercase">{eyebrow}</p>
                <h1 className="mt-2">{title}</h1>
                <p className="text-muted-foreground/60 mt-8 text-sm md:text-base lg:text-lg">{description}</p>
                <div className="mt-8 flex items-center justify-center gap-4">
                    {secondaryLink && (
                        <Button asChild size="lg" variant="secondary">
                            <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
                        </Button>
                    )}
                    {onRetry && (
                        <Button size="lg" variant="secondary" onClick={onRetry}>
                            Try again
                        </Button>
                    )}
                    <Button asChild size="lg">
                        <Link href="/">Return home</Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
