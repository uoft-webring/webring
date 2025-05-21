"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { UserType, User } from "@/utils/zod";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import React, { MouseEventHandler, useState } from "react";
import { z } from "zod";

type UserKeys = z.infer<ReturnType<typeof User.keyof>>;

export default function EditProfile({
    data,
    prev,
    next,
}: {
    data: UserType;
    prev: React.MouseEventHandler<HTMLButtonElement>;
    next: React.MouseEventHandler<HTMLButtonElement>;
}) {
    const [formData, setFormData] = useState<any>(data);
    const [errors, setErrors] = useState<Record<UserKeys, string | null>>(
        Object.fromEntries(
            User.keyof().options.map((key) => [key, null])
        ) as Record<UserKeys, string | null>
    );

    const debounceCallback = useDebounce(
        (e: React.ChangeEvent<HTMLInputElement>, property: UserKeys) => {
            let newObject: any = { ...formData };
            newObject[property] = e.target.value;
            setFormData(newObject);
            const parseResult = User.safeParse(newObject);

            if (parseResult.success) {
                // Handle saving here
                console.log(User.parse(newObject));
            } else {
                // console.log(parseResult.error.errors);
                // const errorObject = parseResult.error.errors.map(
                //     (errorItem) => ({ [errorItem.path[1]]: errorItem.message })
                // );
                // console.log(errorObject);
                // console.log({ ...errors, ...errorObject });
                // setErrors((error) => {
                //     return
                // })

                console.log(parseResult.error.issues);
                // var newErrors = errors;
                // for (const error of parseResult.error.issues) {
                //     console.log(error);
                // }
            }
        },
        500
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};
    return (
        <>
            <h2>Edit your profile</h2>
            <p className="mb-6">
                Complete the information below to complete your profile.
            </p>
            <form>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <div className="grname gap-2 [&>input]:mb-4 [&>input]:mt-1">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                name="name"
                                type="email"
                                placeholder="your.email@mail.utoronto.ca"
                                required
                                defaultValue={formData.name}
                                onChange={(e) => debounceCallback(e, "name")}
                                error={errors.name ?? ""}
                            />
                            <Label htmlFor="email">Email</Label>
                            <Input
                                disabled
                                name="email"
                                type="email"
                                placeholder="your.email@mail.utoronto.ca"
                                required
                                defaultValue={formData.email}
                                onChange={(e) => debounceCallback(e, "email")}
                                error={errors.email ?? ""}
                            />
                            <Label htmlFor="domain">Portfolio link</Label>
                            <Input
                                name="domain"
                                type="url"
                                placeholder="https://yourdomain.com"
                                required
                                defaultValue={formData.domain}
                                onChange={(e) => debounceCallback(e, "domain")}
                                error={errors.domain ?? ""}
                            />
                            <Label htmlFor="github">GitHub link</Label>
                            <Input
                                name="github"
                                type="url"
                                placeholder="https://github.com/your-username"
                                required
                                defaultValue={formData.github_url ?? ""}
                                onChange={(e) =>
                                    debounceCallback(e, "github_url")
                                }
                                error={errors.github_url ?? ""}
                            />
                            <Label htmlFor="profile">
                                Profile picture link
                            </Label>
                            <Input
                                name="profile"
                                type="url"
                                placeholder="https://yourdomain.com/profile.jpg"
                                required
                                defaultValue={formData.image_url ?? ""}
                                onChange={(e) =>
                                    debounceCallback(e, "image_url")
                                }
                                error={errors.image_url ?? ""}
                            />
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                name="tags"
                                type="text"
                                placeholder="https://github.com/your-username"
                                required
                                defaultValue={
                                    JSON.stringify(formData.tags) ?? ""
                                }
                                onChange={(e) => debounceCallback(e, "tags")}
                                error={errors.tags ?? ""}
                            />
                        </div>
                        <div className="flex justify-start items-center gap-4">
                            <Button variant={"secondary"} onClick={prev}>
                                Back
                            </Button>
                            {/* <Link href="/dashboard">
                                <Button variant={"outline"}>Dashboard</Button>
                            </Link> */}

                            <Button className="ml-auto" onClick={next}>
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
