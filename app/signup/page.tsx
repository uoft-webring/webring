"use client";
import { Input } from "@/components/ui/input";
import { signUpAction } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

export default function SignUp() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card className="gap-4">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">
                                Welcome back
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={signUpAction}>
                                <div className="grid gap-6">
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                name="name"
                                                type="text"
                                                placeholder="John Doe"
                                                required
                                                defaultValue={"Aman Meherally"}
                                            />
                                        </div>
                                        <div className="grname gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="your.email@mail.utoronto.ca"
                                                required
                                                defaultValue={
                                                    "aman.m@mail.utoronto.ca"
                                                }
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                    <div className="text-center text-sm">
                                        Haven't signed up yet?{" "}
                                        <a
                                            href="#"
                                            className="underline underline-offset-4"
                                        >
                                            Sign up here
                                        </a>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
