"use client";

import { useRef, useState } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { createAvatarUpload } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImageCropper } from "./ImageCropper";

const MAX_SOURCE_BYTES = 4 * 1024 * 1024;
const MAX_SOURCE_DIMENSION = 4096;
const MAX_ASPECT_RATIO = 2.3;
// Displayed at <= 128px; 512px keeps it sharp on high-DPI screens
const OUTPUT_SIZE = 512;

function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load image."));
        image.src = src;
    });
}

function dimensionProblem(image: HTMLImageElement): string | null {
    if (image.width === 0 || image.height === 0) return "Invalid image dimensions";
    if (image.width > MAX_SOURCE_DIMENSION || image.height > MAX_SOURCE_DIMENSION) {
        return `Image is too large (${image.width}×${image.height}px). Max is ${MAX_SOURCE_DIMENSION}×${MAX_SOURCE_DIMENSION}px.`;
    }
    if (Math.max(image.width, image.height) / Math.min(image.width, image.height) > MAX_ASPECT_RATIO) {
        return "Image is too wide or tall. Use a squarer image (aspect ratio under 2.3:1).";
    }
    return null;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function cropToBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const scaleX = image.naturalWidth / (image.width || image.naturalWidth);
    const scaleY = image.naturalHeight / (image.height || image.naturalHeight);
    const sourceWidth = Math.max(1, Math.round(crop.width * scaleX));
    const sourceHeight = Math.max(1, Math.round(crop.height * scaleY));
    const downscale = Math.min(1, OUTPUT_SIZE / Math.max(sourceWidth, sourceHeight));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sourceWidth * downscale);
    canvas.height = Math.round(sourceHeight * downscale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not supported.");
    context.drawImage(
        image,
        Math.round(crop.x * scaleX),
        Math.round(crop.y * scaleY),
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Not every browser can encode AVIF (unsupported types silently fall back to PNG), so fall
    // back to WebP/JPEG to keep the upload small. Browsers sniff image bytes, not the extension.
    for (const [type, quality] of [
        ["image/avif", 0.6],
        ["image/webp", 0.8],
        ["image/jpeg", 0.85],
    ] as const) {
        const blob = await canvasToBlob(canvas, type, quality);
        if (blob?.type === type) return blob;
    }
    throw new Error("Could not encode image.");
}

export function AvatarInput({
    id,
    error,
    onUploaded,
}: {
    id?: string;
    error?: string;
    onUploaded: (imageKey: string) => void;
}): React.JSX.Element {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [fileName, setFileName] = useState("");
    const [crop, setCrop] = useState<Crop | undefined>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();
    const [localError, setLocalError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const close = () => {
        setImageSrc(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
    };

    const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        // Clear so picking the same file again still fires onChange
        input.value = "";
        if (!file) return;

        setLocalError(null);
        if (file.size > MAX_SOURCE_BYTES) {
            setLocalError(`Please upload an image smaller than ${MAX_SOURCE_BYTES / 1024 / 1024}MB`);
            return;
        }
        try {
            const dataUrl = await readAsDataUrl(file);
            const problem = dimensionProblem(await loadImage(dataUrl));
            if (problem) {
                setLocalError(problem);
                return;
            }
            setFileName(file.name);
            setImageSrc(dataUrl);
        } catch {
            setLocalError("Unexpected error validating image");
        }
    };

    const upload = async () => {
        if (!completedCrop || !imageRef.current) {
            setLocalError("Please complete cropping before saving.");
            return;
        }

        setUploading(true);
        try {
            const blob = await cropToBlob(imageRef.current, completedCrop);
            const { data, error: uploadError } = await createAvatarUpload(blob.size);
            if (uploadError !== null) throw new Error(uploadError);

            const response = await fetch(data.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": "image/avif" },
                body: blob,
            });
            if (!response.ok) throw new Error(`Upload failed with ${response.status}`);

            // Saving the key happens through the normal profile save, which also removes the old image
            onUploaded(data.imageKey);
            close();
        } catch (uploadError) {
            console.error("[avatar] Upload failed:", uploadError);
            setLocalError("Failed to upload image. Try again.");
        } finally {
            setUploading(false);
        }
    };

    const message = localError ?? error;

    return (
        <>
            <div>
                <Input
                    id={id}
                    name="image_key"
                    type="file"
                    accept="image/*"
                    required={false}
                    onChange={onFileChange}
                    className="hover:bg-input/50"
                    aria-invalid={!!message}
                />
                {message ? (
                    <p role="alert" className="text-destructive mt-1 text-sm" aria-live="polite">
                        {message}
                    </p>
                ) : null}
            </div>

            <Dialog open={imageSrc !== null} onOpenChange={(open) => !open && !uploading && close()}>
                <DialogContent showCloseButton={true}>
                    <div className="flex flex-col space-y-4">
                        <DialogHeader className="flex flex-col justify-center text-center">
                            <DialogTitle className="text-center text-lg font-medium">
                                Crop image {fileName && `— ${fileName}`}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-center text-sm">
                                Drag to select crop area.
                            </DialogDescription>
                        </DialogHeader>
                        {imageSrc && (
                            <ImageCropper
                                crop={crop}
                                setCropAction={setCrop}
                                setCompletedCropAction={setCompletedCrop}
                                imageSrc={imageSrc}
                                imageRef={imageRef}
                            />
                        )}

                        <DialogFooter className="flex items-center justify-around">
                            <Button variant="destructive" onClick={close} disabled={uploading}>
                                Cancel
                            </Button>
                            {completedCrop && (
                                <div className="text-md flex-1 text-center">
                                    <div>
                                        Crop: {Math.round(completedCrop.width)}x{Math.round(completedCrop.height)}
                                    </div>
                                </div>
                            )}
                            <Button onClick={upload} disabled={uploading || !completedCrop}>
                                {uploading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
