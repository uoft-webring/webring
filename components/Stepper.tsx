"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/cn";

type Step = { id: string; title: string };

/** Dashboard progress nav. The current step comes straight from the URL. */
export function Stepper({ steps, className }: { steps: Step[]; className?: string }): React.JSX.Element | null {
    const pathname = usePathname();
    const currentIndex = steps.findIndex((step) => pathname.startsWith(`/dashboard/${step.id}`));
    // Other dashboard pages (stats) aren't part of onboarding
    if (currentIndex === -1) return null;

    return (
        <nav aria-label="Onboarding steps" className={cn(className)}>
            <ol className="flex flex-row md:flex-col">
                {steps.map((step, index, array) => (
                    <Fragment key={step.id}>
                        <li className="flex flex-shrink-0">
                            <Link
                                href={`/dashboard/${step.id}`}
                                aria-current={index === currentIndex ? "step" : undefined}
                                className="flex flex-shrink-0 cursor-pointer flex-col items-center gap-2 sm:flex-row"
                            >
                                <span
                                    className={cn(
                                        buttonVariants({ variant: index <= currentIndex ? "default" : "secondary" }),
                                        "cursor-pointer rounded-full md:text-lg"
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <span className="text-sm font-medium md:text-lg">{step.title}</span>
                            </Link>
                        </li>

                        {index < array.length - 1 && (
                            <>
                                <Separator
                                    aria-hidden
                                    /* TODO: find a better vertical height center'er on mobile than `my-4` */
                                    className={`my-4 h-8 flex-1 md:hidden ${
                                        index < currentIndex ? "bg-primary" : "bg-muted"
                                    }`}
                                ></Separator>
                                <Separator
                                    aria-hidden
                                    orientation="vertical"
                                    className={`mx-5 hidden md:flex ${index < currentIndex ? "bg-primary" : "bg-muted"}`}
                                ></Separator>
                                <Separator
                                    aria-hidden
                                    orientation="vertical"
                                    className={`mx-5 hidden md:flex ${index < currentIndex ? "bg-primary" : "bg-muted"}`}
                                ></Separator>
                            </>
                        )}
                    </Fragment>
                ))}
            </ol>
        </nav>
    );
}
