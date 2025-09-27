"use client";

import { Input } from "./ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ImageCropper from "@/components/ImageCropper";
import { Crop, PixelCrop } from "react-image-crop";
import { useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { z } from "zod";
import { deletePreviousImage, requestPresignedUrl } from "@/app/dashboard/edit/actions";
import { User } from "@/utils/zod";

/* ----------------------------- Types & Helpers ---------------------------- */

function checkImageDimensions(
    file: Blob,
    displayError: (msg: string) => void
): Promise<{
    success: boolean;
    reason?: string;
}> {
    // Primarily loading any image, checking aspect ratio and if w/h>0
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const result = e.target?.result;
            if (!result) {
                return resolve({ success: false, reason: "Unable to read file" });
            }
            const img = new Image();
            img.onload = () => {
                if (img.width === 0 || img.height === 0) {
                    return resolve({ success: false, reason: "Invalid image dimensions" });
                }
                // Check if img width or height is bigger than page
                if (typeof window !== "undefined") {
                    // When we display the image, it's scaled down, so we check against half its size
                    if (img.width / 2 > window.innerWidth || img.height / 2 > window.innerHeight) {
                        return resolve({ success: false, reason: "Image dimensions too large" });
                    }
                }

                const dimensionRatio = Math.max(img.width, img.height) / Math.min(img.width, img.height);
                if (dimensionRatio > 2.3) {
                    return resolve({
                        success: false,
                        reason: "Image aspect ratio too sharp",
                    });
                }
                displayError("");
                resolve({ success: true });
            };
            img.onerror = () => {
                resolve({ success: false, reason: "Failed to load image" });
            };
            img.src = result.toString();
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file."));
        };

        reader.readAsDataURL(file);
    });
}

type UserKeys = z.infer<ReturnType<typeof User.keyof>>;

interface ImageInputInterface {
    errors: Record<UserKeys, string | undefined>;
    setErrors: React.Dispatch<React.SetStateAction<Record<UserKeys, string | undefined>>>;
    saveToForm: (data: Record<string, any>) => void;
}

export default function ImageInput({ errors, setErrors, saveToForm }: ImageInputInterface) {
    const [open, setOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop | undefined>(undefined);
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>(undefined);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    const displayError = useCallback(
        (msg: string) => {
            setErrors((prev) => ({ ...prev, image_key: msg }));
        },
        [setErrors]
    );

    // Handle input change --> validate image size/ratio/dimensions --> open in dialog or error
    const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxAllowedMBSize = 1;
        const maxAllowedSize = maxAllowedMBSize * 1024 * 1024;

        if (file.size > maxAllowedSize) {
            e.target.value = "";
            displayError(`Please upload an image smaller than ${maxAllowedMBSize}MB`);
            return;
        }

        try {
            const { success, reason } = await checkImageDimensions(file, displayError);
            if (!success) {
                e.target.value = "";
                displayError(reason!);
                return;
            }

            // read as data URL and open dialog
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result?.toString() ?? null);
                setSelectedFileName(file.name);
                setCrop(undefined);
                setCompletedCrop(undefined);
                setOpen(true);
            };
            reader.onerror = () => {
                displayError("Failed to read uploaded file");
            };
            reader.readAsDataURL(file);
        } catch (err) {
            displayError("Unexpected error validating image");
            console.error(err);
        } finally {
            // clear input value so same file can be re-picked
            if (e.currentTarget) e.currentTarget.value = "";
        }
    };

    // Converts cropped image to blob/avif for upload
    const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas toBlob failed"));
                },
                type,
                quality
            );
        });
    };

    const cropImage = async (imageEl: HTMLImageElement, cropDef: PixelCrop, quality = 0.5): Promise<File> => {
        const scaleX = imageEl.naturalWidth / (imageEl.width || imageEl.naturalWidth);
        const scaleY = imageEl.naturalHeight / (imageEl.height || imageEl.naturalHeight);

        const width = Math.max(1, Math.round(cropDef.width));
        const height = Math.max(1, Math.round(cropDef.height));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        ctx.drawImage(
            imageEl,
            Math.round(cropDef.x * scaleX),
            Math.round(cropDef.y * scaleY),
            Math.round(cropDef.width * scaleX),
            Math.round(cropDef.height * scaleY),
            0,
            0,
            width,
            height
        );

        const blob = await canvasToBlob(canvas, "image/avif", quality);

        return new File([blob], "cropped.avif", { type: "image/avif" });
    };

    const uploadToS3 = async (presignedUrl: string, file: File) => {
        const response = await fetch(presignedUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "image/avif",
            },
            body: file,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return true;
    };

    const saveImage = async (completedCropArg?: PixelCrop) => {
        setErrors((prev) => ({ ...prev, image_key: "" }));

        if (!completedCropArg || !imageRef.current) {
            displayError("Please complete cropping before saving.");
            return;
        }

        setLoading(true);
        try {
            // Crop image, degrade quality and convert to avif
            const file = await cropImage(imageRef.current, completedCropArg, 0.5);

            // Request presignedUrl from server and get object key to save
            const { presignedUrl, objectKey } = await requestPresignedUrl();
            await uploadToS3(presignedUrl, file);
            await deletePreviousImage();
            saveToForm({ image_key: objectKey });

            // close dialog & reset
            setOpen(false);
            setImageSrc(null);
            setCompletedCrop(undefined);
            setCrop(undefined);
            setSelectedFileName(null);
        } catch (err) {
            displayError("Failed to upload image. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                <Input
                    name="image_key"
                    type="file"
                    accept="image/*"
                    required={false}
                    onChange={handleOnChange}
                    className="hover:bg-input/50"
                    aria-invalid={!!errors.image_key}
                />
                {errors.image_key ? (
                    <p role="alert" className="text-destructive mt-1 text-sm" aria-live="polite">
                        {errors.image_key}
                    </p>
                ) : null}
            </div>

            <Dialog
                open={open}
                onOpenChange={(v) => {
                    if (!v) {
                        setOpen(false);
                        setImageSrc(null);
                    }
                }}
            >
                <DialogContent showCloseButton={true} className="max-img.width-3xl">
                    <div className="flex flex-col space-y-4">
                        <DialogHeader className="flex flex-col justify-center text-center">
                            <DialogTitle
                                className="text-center text-lg font-medium"
                                aria-describedby="dialog-description"
                            >
                                Crop image {selectedFileName ? `— ${selectedFileName}` : ""}
                            </DialogTitle>
                            <DialogDescription
                                id="dialog-description"
                                className="text-muted-foreground text-center text-sm"
                            >
                                Drag to select crop area.
                            </DialogDescription>
                        </DialogHeader>
                        {imageSrc ? (
                            <ImageCropper
                                crop={crop}
                                setCropAction={setCrop}
                                setCompletedCropAction={setCompletedCrop}
                                imageSrc={imageSrc}
                                imageRef={imageRef}
                            />
                        ) : (
                            <p>No image selected.</p>
                        )}

                        <DialogFooter className="flex items-center justify-around">
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setOpen(false);
                                    setImageSrc(null);
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            {completedCrop && imageRef.current ? (
                                <div className="text-md flex-1 text-center">
                                    <div>
                                        Crop: {Math.round(completedCrop.width)}x
                                        {Math.round(completedCrop.height)}
                                    </div>
                                </div>
                            ) : null}
                            <Button
                                onClick={() => {
                                    if (!completedCrop) {
                                        displayError("No crop selected. Drag to select an area.");
                                        return;
                                    }
                                    saveImage(completedCrop);
                                }}
                                disabled={loading || !completedCrop}
                            >
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
