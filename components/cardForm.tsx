import React, { Children } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { signUpAction } from "@/app/signup/actions";
import { Label } from "@radix-ui/react-label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function CardForm({
    cardTitle,
    cardDescription,
    children,
    ...props
}: {
    cardTitle?: string;
    cardDescription?: string;
} & React.ComponentPropsWithoutRef<"div">) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card className="gap-4">
                        <CardHeader className="text-center">
                            {cardTitle && (
                                <CardTitle className="text-2xl">
                                    {cardTitle}
                                </CardTitle>
                            )}
                            {cardDescription && (
                                <CardDescription>
                                    {cardDescription}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>{Children && children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
