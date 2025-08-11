"use client";

import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import ImageCropper from "@/components/ImageCropper";
import { Crop } from "react-image-crop";
import { max } from "three/src/nodes/TSL.js";

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
    const [open, setOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [crop, setCrop] = useState<Crop>();

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

    const saveImage = () => {
        console.log("subbed form");
        setOpen(false);
    };

    const loadImage = (path: string) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // img.crossOrigin = "Anonymous"; // to avoid CORS if used with Canvas
            img.src = path;
            img.onload = () => {
                resolve(img);
            };
            img.onerror = (e) => {
                reject(e);
            };
        });
    };

    /*
     * Checks if an uploaded image
     * @param {file} file that is uploaded by user
     * @param {minWidth} minimum width of image defined
     * @param {minHeight} minimum height of image defined
     * @param {maxWidth} maximum width of image defined
     * @param {maxHeight} minimum height of image defined
     * @returns success status for image dimension check and "reason" for checkImageDimension
     *          to fail, or empty string if check is successful
     */
    function checkImageDimensions(file, minWidth, minHeight, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const isMaxWithinLimits = img.width < maxWidth && img.height < maxHeight;
                    const isMinWithinLimits = img.width >= minWidth && img.height >= minHeight;
                    if (!isMinWithinLimits) {
                        resolve({ reason: "min", success: false, image: e.target.result });
                    }
                    if (!isMaxWithinLimits) {
                        resolve({ reason: "max", success: false, image: e.target.result });
                    }
                    // console.log("within limits", isWithinLimits);
                    resolve({ reason: "", success: true }); // resolve returns value for Promise
                };
                img.onerror = () => {
                    reject(new Error("Failed to load image."));
                };
                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file."));
            };

            reader.readAsDataURL(file);
        });
    }

    const loadImage = (path: string) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // img.crossOrigin = "Anonymous"; // to avoid CORS if used with Canvas
            img.src = path;
            img.onload = () => {
                resolve(img);
            };
            img.onerror = (e) => {
                reject(e);
            };
        });
    };

    /*
     * Checks if an uploaded image
     * @param {file} file that is uploaded by user
     * @param {minWidth} minimum width of image defined
     * @param {minHeight} minimum height of image defined
     * @param {maxWidth} maximum width of image defined
     * @param {maxHeight} minimum height of image defined
     * @returns success status for image dimension check and "reason" for checkImageDimension
     *          to fail, or empty string if check is successful
     */
    function checkImageDimensions(file, minWidth, minHeight, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const isMaxWithinLimits = img.width < maxWidth && img.height < maxHeight;
                    const isMinWithinLimits = img.width >= minWidth && img.height >= minHeight;
                    if (!isMinWithinLimits) {
                        resolve({ reason: "min", success: false, image: e.target.result });
                    }
                    if (!isMaxWithinLimits) {
                        resolve({ reason: "max", success: false, image: e.target.result });
                    }
                    // console.log("within limits", isWithinLimits);
                    resolve({ reason: "", success: true }); // resolve returns value for Promise
                };
                img.onerror = () => {
                    reject(new Error("Failed to load image."));
                };
                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file."));
            };

            reader.readAsDataURL(file);
        });
    }

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
                        {/* <Input
                            name="program"
                            type="text"
                            placeholder="Computer Science"
                            defaultValue={formData.program ?? ""}
                            onChange={(e) => {
                                const value = e.currentTarget.value.trim();
                                saveToForm({ program: value === "" ? null : value });
                            }}
                            error={errors.program}
                        /> */}
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
                <Label htmlFor="image_url">Profile picture</Label>
                <Dialog open={open}>
                    <DialogTrigger asChild>
                        <Input
                            name="image_url"
                            type="file"
                            accept="image/*"
                            // placeholder="https://yourdomain.com/profile.jpg"
                            required
                            defaultValue={formData.image_url ?? ""}
                            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                setErrors({
                                    ...errors,
                                    image_url: "",
                                });

                                // Check if an image is uploaded
                                if (e.target.files && e.target.files.length > 0) {
                                    // Enforce hard cap on image size
                                    const maxAllowedMBSize = 5;
                                    const maxAllowedSize = maxAllowedMBSize * 1024 * 1024;
                                    // Get file size and compare
                                    if (e.target.files[0].size > maxAllowedSize) {
                                        e.target.value = "";
                                        setErrors({
                                            ...errors,
                                            image_url: `Please upload an image smaller than ${maxAllowedMBSize}MB`,
                                        });
                                    }

                                    // Enforce image dimensions
                                    const minAllowedImageDimensions = 100;
                                    const maxAllowedImageDimensions = 2048;

                                    // Check if image uploaded passes image dimension check
                                    const { reason, success } = await checkImageDimensions(
                                        e.target.files[0],
                                        minAllowedImageDimensions,
                                        minAllowedImageDimensions,
                                        maxAllowedImageDimensions,
                                        maxAllowedImageDimensions
                                    );

                                    if (!success) {
                                        e.target.value = "";
                                        setErrors({
                                            ...errors,
                                            image_url:
                                                reason === "min"
                                                    ? `Min image width and height ${minAllowedImageDimensions}`
                                                    : `Max image width and height ${maxAllowedImageDimensions}`,
                                        });
                                    }

                                    setCrop(undefined);
                                    setImageSrc("");

                                    const reader = new FileReader();

                                    reader.addEventListener("load", async () => {
                                        const file = reader?.result?.toString() || "";
                                        setImageSrc(file);
                                    });

                                    reader.readAsDataURL(e.target.files[0]);

                                    console.log("user uploaded image", e.target.value);
                                    setOpen(true);
                                }
                                // saveToForm({
                                //     image_url: e.target.value,
                                // });
                            }}
                            className="hover:bg-input/50"
                            error={errors.image_url}
                        />
                    </DialogTrigger>
                    <DialogContent showCloseButton={false} className="">
                        {/* <DialogTitle className="">Crop avatar</DialogTitle> */}
                        {/* <DialogDescription></DialogDescription> */}
                        <ImageCropper crop={crop} setCrop={setCrop} imageSrc={imageSrc} maxHeight={100} />
                        <Button onClick={() => saveImage()}>Save</Button>
                    </DialogContent>
                </Dialog>
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
