import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function CardForm({
    cardTitle,
    cardDescription,
    children,
}: {
    cardTitle?: string;
    cardDescription?: string;
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <div className="bg-background flex min-h-svh flex-1 flex-col items-center justify-center gap-6 rounded-xl p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card className="gap-4">
                        <CardHeader className="text-center">
                            {cardTitle && (
                                <CardTitle>
                                    <h1 className="m-0 p-0 text-3xl leading-normal">{cardTitle}</h1>
                                </CardTitle>
                            )}
                            {cardDescription && (
                                <CardDescription>
                                    {cardDescription.split("\n").map((line) => (
                                        <div key={line}>
                                            {line}
                                            <br />
                                        </div>
                                    ))}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
