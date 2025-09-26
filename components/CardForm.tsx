import React, { Children } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function CardForm({
    cardTitle,
    cardDescription,
    children,
}: {
    cardTitle?: string;
    cardDescription?: string;
} & React.ComponentPropsWithoutRef<"div">) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 rounded-xl p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card className="gap-4">
                        <CardHeader className="text-center">
                            {cardTitle && (
                                <CardTitle>
                                    {/* For semanticity */}
                                    <h1 className="m-0 p-0 text-3xl leading-normal">{cardTitle}</h1>
                                </CardTitle>
                            )}
                            {cardDescription && (
                                <CardDescription>
                                    {cardDescription.split("\n").map((line) => {
                                        return (
                                            <div key={line}>
                                                {line}
                                                <br />
                                            </div>
                                        );
                                    })}
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
