"use client";

import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ImageCropper from "@/components/ImageCropper";
import { Crop, PixelCrop } from "react-image-crop";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { z } from "zod";
import { saveCroppedImaged } from "@/app/dashboard/edit/actions";
import { User } from "@/utils/zod";

type CheckImageDimensionReturn = {
    success: boolean;
    image: string | ArrayBuffer | null | undefined;
};

/*
 * Checks if an uploaded image fulfills dimension requirements
 *
 * @param {file} file that is uploaded by user
 * @param {minWidth} minimum width of image defined
 * @param {minHeight} minimum height of image defined
 * @param {maxWidth} maximum width of image defined
 * @param {maxHeight} minimum height of image defined
 * @returns success status for image dimension check and "reason" for checkImageDimension
 *          to fail, or empty string if check is successful
 */
function checkImageDimensions(
    file: Blob,
    maxDimensionRatio: number
): Promise<CheckImageDimensionReturn> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const dimensionRatio = Math.max(img.width, img.height) / Math.min(img.width, img.height);

                if (dimensionRatio > maxDimensionRatio)
                {
                    resolve({ success: false, image: e.target?.result})
                }

                resolve({ success: true, image: null }); // resolve returns value for Promise
            };
            img.onerror = () => {
                reject(new Error("Failed to load image."));
            };
            img.src = e.target?.result?.toString() || "";
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
    saveToForm: (data: Record<string, any>) => void; // TODO: how do i do this...
}
export default function ImageInput({ errors, setErrors, saveToForm }: ImageInputInterface) {
    const [open, setOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [crop, setCrop] = useState<Crop | undefined>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();
    const imageRef = useRef(null);

    const saveImage = async (imageSrc: string, completedCrop: PixelCrop | undefined) => {
        // Null check for imageRef
        if (imageRef.current === null) {
            setErrors({
                ...errors,
                image_key: `Unexpected image upload error`,
            });
            return;
        }

        const image: HTMLImageElement = imageRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const croppedImage = await saveCroppedImaged(imageSrc, completedCrop!, scaleX, scaleY);
        saveToForm({
            image_key: croppedImage,
        });
        setOpen(false);
    };

    const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrors({
            ...errors,
            image_key: "",
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
                    image_key: `Please upload an image smaller than ${maxAllowedMBSize}MB`,
                });
            }

            // Enforce image dimensions
            const maxDimensionRatio = 2.3;

            // Check if image uploaded passes image dimension check
            const { success } = await checkImageDimensions(
                e.target.files[0],
                maxDimensionRatio
            );

            if (!success) {
                e.target.value = "";
                setErrors({
                    ...errors,
                    image_key: "Image exceeded allowed dimensions"
                });
            }

            setCrop(undefined);
            setImageSrc("");

            const reader = new FileReader();

            reader.addEventListener("load", async () => {
                if (reader?.result) {
                    const file = reader?.result.toString() || "";
                    setImageSrc(file);
                }
            });

            reader.readAsDataURL(e.target.files[0]);
            setOpen(true);
        }
    };

    return (
        <Dialog open={open}>
            <DialogTrigger asChild>
                <Input
                    name="image_key"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleOnChange}
                    className="hover:bg-input/50"
                    error={errors.image_key}
                />
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="">
                {/* <DialogTitle className="">Crop avatar</DialogTitle> */}
                {/* <DialogDescription></DialogDescription> */}
                <ImageCropper
                    crop={crop}
                    setCrop={setCrop}
                    setCompletedCrop={setCompletedCrop!}
                    imageSrc={imageSrc}
                    imageRef={imageRef}
                />
                <Button onClick={() => saveImage(imageSrc, completedCrop)}>Save</Button>
            </DialogContent>
        </Dialog>
    );
}
