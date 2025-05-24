"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TagInputComponent from "@/components/ui/input-tag";
import { Textarea } from "@/components/ui/textarea";
import useDebounce from "@/hooks/useDebounce";
import { UserType, User } from "@/utils/zod";
import { Label } from "@radix-ui/react-label";
import React, { MouseEventHandler, useState } from "react";
import { z } from "zod";

type UserKeys = z.infer<ReturnType<typeof User.keyof>>;
const NO_ERRORS = Object.fromEntries(
    User.keyof().options.map((key) => [key, undefined])
) as Record<UserKeys, string | undefined>;

/**
 * The flow of the component lifecycle is as follows:
 *
 * 1) On a text field update, calls `saveToForm()` to update `formData` immediately.
 * 2) Calls `debounceCallback()` to attempt to validate format of data and either push to DB
 * or show error state accordingly.
 */
export default function EditProfile({ data }: { data: UserType }) {
    const [formData, setFormData] = useState<any>(data);
    const [errors, setErrors] = useState<Record<UserKeys, string | undefined>>(
        structuredClone(NO_ERRORS)
    );

    console.log("Rendering Parent with tags:", formData.tags);

    const debounceCallback = useDebounce((newData: any) => {
        const parseResult = User.safeParse(newData);
        console.log(parseResult);
        if (parseResult.success) {
            // Save to DB here through actions.ts
            setErrors(NO_ERRORS);
        } else {
            // structuredClone produces a deep copy of No_ERRORS, otherwise
            // error states update after onChange of the next updated text field,
            // resulting in buggy ui.
            let newErrors = structuredClone(NO_ERRORS);
            parseResult.error.issues.forEach((issue) => {
                newErrors[issue.path[0] as UserKeys] = issue.message;
            });

            console.log(newErrors);
            setErrors(newErrors);
        }
    }, 500);

    const saveToForm = (key: UserKeys, value: string | string[]) => {
        const newData = { ...formData, [key]: value };
        setFormData(newData);
        debounceCallback(newData);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};
    return (
        <>
            <h2>Edit your profile</h2>
            <p className="mb-6">
                Complete the information below to complete your profile.
            </p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                }}
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <div className="grname gap-2 [&>*:not(label)]:mb-4 [&>*:not(label)]:mt-1">
                            <Label
                                htmlFor="name"
                                className="after:content-['*'] after:text-destructive after:ml-1"
                            >
                                Name
                            </Label>
                            <Input
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                required
                                defaultValue={formData.name}
                                onChange={(e) => {
                                    saveToForm("name", e.target.value);
                                }}
                                error={errors.name}
                            />
                            <Label
                                htmlFor="email"
                                className="after:content-['*'] after:text-destructive after:ml-1"
                            >
                                Email
                            </Label>
                            <Input
                                disabled
                                name="email"
                                type="email"
                                placeholder="your.email@mail.utoronto.ca"
                                required
                                defaultValue={formData.email}
                                error={errors.email}
                            />
                            <Label
                                htmlFor="domain"
                                className="after:content-['*'] after:text-destructive after:ml-1"
                            >
                                Portfolio link
                            </Label>
                            <Input
                                name="domain"
                                type="url"
                                placeholder="https://yourdomain.com"
                                required
                                defaultValue={formData.domain}
                                onChange={(e) => {
                                    saveToForm("domain", e.target.value);
                                }}
                                error={errors.domain}
                            />
                            <Label htmlFor="github_url">GitHub link</Label>
                            <Input
                                name="github_url"
                                type="url"
                                placeholder="https://github.com/your-username"
                                required
                                defaultValue={formData.github_url}
                                onChange={(e) => {
                                    saveToForm("github_url", e.target.value);
                                }}
                                error={errors.github_url}
                            />
                            <Label htmlFor="image_url">
                                Profile picture link
                            </Label>
                            <Input
                                name="image_url"
                                type="url"
                                placeholder="https://yourdomain.com/profile.jpg"
                                required
                                defaultValue={formData.image_url ?? ""}
                                onChange={(e) => {
                                    saveToForm("image_url", e.target.value);
                                }}
                                error={errors.image_url}
                            />
                            <Label htmlFor="tags">Tags</Label>
                            {/* <Input
                                name="tags"
                                type="text"
                                placeholder="https://github.com/your-username"
                                required
                                defaultValue={
                                    JSON.stringify(formData.tags) ?? ""
                                }
                                onChange={(e) => {
                                    saveToForm("name", e.target.value);
                                }}
                                error={errors.tags}
                            /> */}
                            <TagInputComponent
                                tags={formData.tags}
                                onTagsChange={(tags: string[]) => {
                                    console.log("Saving", tags);
                                    saveToForm("tags", tags);
                                }}
                                error={errors.tags}
                            />
                            <Label htmlFor="tagline">Tagline</Label>
                            <Textarea
                                name="tagline"
                                placeholder="John Doe is a full stack..."
                                required
                                remaining={255 - formData.tagline.length}
                                defaultValue={formData.tagline ?? ""}
                                onChange={(e) => {
                                    saveToForm("tagline", e.target.value);
                                }}
                                error={errors.tagline}
                            />
                        </div>
                        {/* <div className="flex justify-start items-center gap-4">
                            <Button variant={"secondary"} onClick={prev}>
                                Back
                            </Button>

                            <Button className="ml-auto" onClick={next}>
                                Continue
                            </Button>
                        </div> */}
                    </div>
                </div>
            </form>
        </>
    );
}
