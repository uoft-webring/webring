"use client";

import { Input } from "@/components/ui/input";
import TagInputComponent from "@/components/ui/input-tag";
import { Textarea } from "@/components/ui/textarea";
import useDebounce from "@/hooks/useDebounce";
import { UserType, User } from "@/utils/zod";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { z } from "zod";
import { saveData } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Form from "next/form";
import ProgramInput from "@/components/ProgramInput";
import ImageInput from "@/components/ImageInput";

type UserKeys = z.infer<ReturnType<typeof User.keyof>>;
const NO_ERRORS = Object.fromEntries(User.keyof().options.map((key) => [key, undefined])) as Record<
    UserKeys,
    string | undefined
>;

/**
 * The flow of the component lifecycle is as follows:
 *
 * 1) On a text field update, calls `saveToForm()` to update `formData` immediately.
 * 2) State is managed by parent component so preview shows the updated data immediately.
 * 3) Calls `debounceCallback()` to attempt to validate format of data and either push to DB
 * or show error state accordingly.
 */
export default function EditForm({
    formData,
    setFormData,
}: {
    formData: UserType;
    setFormData: React.Dispatch<React.SetStateAction<UserType | null>>;
}) {
    // const [formData, setFormData] = useState<UserType>(data);
    const [errors, setErrors] = useState<Record<UserKeys, string | undefined>>(structuredClone(NO_ERRORS));

    console.log("Rendering Parent with tags:", formData.tags);

    const debounceCallback = useDebounce(async (newData: any) => {
        const parseResult = await User.safeParseAsync(newData);
        console.log(parseResult);
        if (parseResult.success) {
            console.log("Saving data!!!");
            // Save to DB here through actions.ts
            const saveResult = await saveData(parseResult.data);
            if (saveResult.error) {
                toast.error("We're sorry! Something went wrong.", {
                    duration: 1000,
                });
            } else {
                toast.success("Your profile has been updated successfully!", {
                    duration: 1000,
                });
            }
            setErrors(NO_ERRORS);
        } else {
            // structuredClone produces a deep copy of No_ERRORS, otherwise
            // error states update after onChange of the next updated text field,
            // resulting in buggy ui.
            const newErrors = structuredClone(NO_ERRORS);
            parseResult.error.issues.forEach((issue) => {
                newErrors[issue.path[0] as UserKeys] = issue.message;
            });

            setErrors(newErrors);
        }
    }, 500);

    const saveToForm = (data: Record<string, any>) => {
        const newData = { ...formData, ...data };
        setFormData(newData);
        debounceCallback(newData);
    };

    // TODO-A check if Next Form can use server action for saving or smth
    // https://nextjs.org/docs/app/api-reference/components/form
    // add fake save button even though we auto save for UX
    return (
        <Form
            action=""
            onSubmit={(e) => {
                e.preventDefault();
            }}
            className="flex flex-col"
        >
            <div className="grname gap-2 [&>*:not(label)]:mb-4 [&>*:not(label)]:mt-1">
                <Label htmlFor="name" className="after:content-['*'] after:text-destructive after:ml-1">
                    Name
                </Label>
                <Input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    defaultValue={formData.name}
                    onChange={(e) => {
                        saveToForm({ name: e.target.value });
                    }}
                    error={errors.name}
                />

                <div className="flex flex-row gap-2 justify-evenly">
                    <div className="flex flex-col gap-2 w-full">
                        <Label
                            htmlFor="graduation_year"
                            className="after:content-['*'] after:text-destructive after:ml-1"
                        >
                            Graduation Year
                        </Label>
                        <Input
                            name="graduation_year"
                            type="number"
                            placeholder="2029"
                            min={1900}
                            max={2500}
                            defaultValue={formData.graduation_year ?? ""}
                            onChange={(e) => {
                                const n = e.currentTarget.valueAsNumber;
                                saveToForm({ graduation_year: Number.isNaN(n) ? null : n });
                            }}
                            error={errors.graduation_year}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <Label
                            htmlFor="program"
                            className="after:content-['*'] after:text-destructive after:ml-1"
                        >
                            Program
                        </Label>
                        <ProgramInput
                            program={formData.program ?? ""}
                            onProgramChange={(program: string) => {
                                saveToForm({ program: program === "" ? null : program });
                            }}
                        />
                    </div>
                </div>
                <Label htmlFor="domain" className="after:content-['*'] after:text-destructive after:ml-1">
                    Portfolio Link
                </Label>
                <Input
                    name="domain"
                    type="url"
                    placeholder="https://yourdomain.com"
                    required
                    defaultValue={formData.domain}
                    onChange={(e) => {
                        saveToForm({
                            domain: e.target.value,
                            is_verified: false,
                        });
                    }}
                    error={errors.domain}
                />
                <Label htmlFor="github_url">GitHub Username</Label>
                <Input
                    /* Data type is named github_url but it's a username */
                    name="github_url"
                    type="text"
                    placeholder="torvalds"
                    required
                    maxLength={39}
                    defaultValue={formData.github_url ?? ""}
                    onChange={(e) => {
                        saveToForm({ github_url: e.target.value });
                    }}
                    error={errors.github_url}
                />
                <Label htmlFor="image_key">Profile picture</Label>
                <ImageInput errors={errors} setErrors={setErrors} saveToForm={saveToForm} />
                <Label htmlFor="tags">Tags</Label>
                <TagInputComponent
                    tags={formData.tags ?? []}
                    onTagsChange={(tags: string[]) => {
                        saveToForm({
                            tags: JSON.stringify(tags) === JSON.stringify([]) ? null : tags,
                        });
                    }}
                    error={errors.tags}
                />
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    name="bio"
                    placeholder="John Doe is a full stack..."
                    required
                    remaining={formData.tagline === null ? 255 : 255 - formData.tagline.length}
                    defaultValue={formData.tagline ?? ""}
                    onChange={(e) => {
                        saveToForm({ tagline: e.target.value });
                    }}
                    className="rounded-xl"
                    error={errors.tagline}
                />
            </div>

            <div className="flex justify-start items-center gap-4">
                {/* TODO-A allow saving or smth */}
                <Button variant="secondary" type="submit">
                    Save
                </Button>

                <Link href="/dashboard/join" className="ml-auto">
                    <Button type="button">Continue</Button>
                </Link>
            </div>
        </Form>
    );
}
