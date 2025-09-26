"use client";
import { defineStepper } from "@stepperize/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Fragment, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
type Step = {
    id: string;
    title: string;
    description: string;
};

export default function Stepper({ steps, className }: { steps: Step[]; className?: string }) {
    const pathname = usePathname();
    const { useStepper, utils } = useMemo(() => defineStepper(...steps), [steps]);
    const stepper = useStepper();
    const currentIndex = utils.getIndex(stepper.current.id);

    const parts = pathname.split("/").filter(Boolean); // e.g. ["dashboard", "edit"]
    const slug = parts[parts.length - 1] ?? ""; // e.g. "edit" or "join"
    const slugIsStep = stepper.all.some((s) => s.id === slug); // not always will a slug match a step (Murphy's law)

    useEffect(() => {
        // Every time the pathname changes, check if the slug matches a step and navigate to it
        if (slugIsStep && stepper.current.id !== slug) stepper.goTo(slug);
    }, [slugIsStep, slug, stepper]);

    return (
        <nav aria-label="" className={cn(className)}>
            <ol className="flex flex-row md:flex-col">
                {stepper.all.map((step, index, array) => (
                    <Fragment key={step.id}>
                        <Link href={`/dashboard/${step.id}`} className="cursor-pointer">
                            <li className="flex flex-shrink-0 flex-col items-center gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    role="tab"
                                    variant={index <= currentIndex ? "default" : "secondary"}
                                    aria-current={stepper.current.id === step.id ? "step" : undefined}
                                    aria-posinset={index + 1}
                                    aria-setsize={stepper.all.length}
                                    aria-selected={stepper.current.id === step.id}
                                    className="cursor-pointer rounded-full md:text-lg"
                                    onClick={() => stepper.goTo(step.id)}
                                >
                                    {index + 1}
                                </Button>
                                <span className="text-sm font-medium md:text-lg">{step.title}</span>
                            </li>
                        </Link>

                        {index < array.length - 1 && (
                            <>
                                <Separator
                                    /* TODO: find a better vertical height center'er on mobile than `my-4` */
                                    className={`my-4 h-8 flex-1 md:hidden ${
                                        index < currentIndex ? "bg-primary" : "bg-muted"
                                    }`}
                                ></Separator>
                                <Separator
                                    orientation="vertical"
                                    className={`mx-5 hidden md:flex ${
                                        index < currentIndex ? "bg-primary" : "bg-muted"
                                    }`}
                                ></Separator>
                                <Separator
                                    orientation="vertical"
                                    className={`mx-5 hidden md:flex ${
                                        index < currentIndex ? "bg-primary" : "bg-muted"
                                    }`}
                                ></Separator>
                            </>
                        )}
                    </Fragment>
                ))}
            </ol>
        </nav>
    );
}
