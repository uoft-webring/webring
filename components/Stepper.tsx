"use client";
import { defineStepper } from "@stepperize/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Stepper({
    steps,
    className,
}: {
    steps: any[];
    className?: string;
}) {
    const pathname = usePathname();
    const pathSegment = pathname.split("/").pop();

    const { useStepper, steps: _, utils } = defineStepper(...steps);
    const stepper = useStepper();
    const currentIndex = utils.getIndex(stepper.current.id);

    useEffect(() => {
        if (
            pathSegment &&
            stepper.current.id !== pathSegment &&
            stepper.all.some((step) => step.id === pathSegment)
        ) {
            stepper.goTo(pathSegment);
        }
    }, [pathSegment, stepper.current.id, stepper]);

    return (
        <nav aria-label="" className={cn(className)}>
            <ol className="flex flex-row md:flex-col ">
                {stepper.all.map((step, index, array) => (
                    <React.Fragment key={step.id}>
                        <Link href={step.id} className="cursor-pointer">
                            <li className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                                <Button
                                    type="button"
                                    role="tab"
                                    variant={
                                        index <= currentIndex
                                            ? "default"
                                            : "secondary"
                                    }
                                    aria-current={
                                        stepper.current.id === step.id
                                            ? "step"
                                            : undefined
                                    }
                                    aria-posinset={index + 1}
                                    aria-setsize={steps.length}
                                    aria-selected={
                                        stepper.current.id === step.id
                                    }
                                    className="rounded-full md:text-lg cursor-pointer"
                                    onClick={() => stepper.goTo(step.id)}
                                >
                                    {index + 1}
                                </Button>
                                <span className="text-sm font-medium md:text-lg">
                                    {step.title}
                                </span>
                            </li>
                        </Link>
                        {index < array.length - 1 && (
                            <>
                                <Separator
                                    /* TODO: find a better vertical height center'er on mobile than `my-4` */
                                    className={`flex-1 h-8 my-4 md:hidden ${
                                        index < currentIndex
                                            ? "bg-primary"
                                            : "bg-muted"
                                    }`}
                                ></Separator>
                                <Separator
                                    orientation="vertical"
                                    className={`hidden md:flex mx-5  ${
                                        index < currentIndex
                                            ? "bg-primary"
                                            : "bg-muted"
                                    }`}
                                ></Separator>
                                <Separator
                                    orientation="vertical"
                                    className={`hidden md:flex mx-5  ${
                                        index < currentIndex
                                            ? "bg-primary"
                                            : "bg-muted"
                                    }`}
                                ></Separator>
                            </>
                        )}
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
}
