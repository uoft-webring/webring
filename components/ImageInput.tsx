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
    file,
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number
) {
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

type UserKeys = z.infer<ReturnType<typeof User.keyof>>;

interface ImageInputInterface {
    errors: Record<UserKeys, string | undefined>;
    setErrors: React.Dispatch<React.SetStateAction<Record<UserKeys, string | undefined>>>;
    saveToForm: any; // TODO: how do i do this...
}
export default function ImageInput({ errors, setErrors, saveToForm }: ImageInputInterface) {
    const [open, setOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imageRef = useRef(null);

    const saveImage = async (imageSrc, completedCrop) => {
        console.log("subbed form", imageSrc);
        console.log("complete crop", completedCrop);

        // Null check for imageRef
        if (imageRef.current === null) {
            setErrors({
                ...errors,
                image_url: `Unexpected image upload error`,
            });
            return;
        }

        const image: HTMLImageElement = imageRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        console.log("natural dimensions", image.naturalWidth, image.naturalHeight);
        const croppedImage = await saveCroppedImaged(imageSrc, completedCrop, scaleX, scaleY);
        console.log(croppedImage);
        saveToForm({
            image_url: croppedImage,
        });
        setOpen(false);
    };

    const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                if (reader?.result) {
                    const file = reader?.result.toString() || "";
                    setImageSrc(file);
                }
            });

            reader.readAsDataURL(e.target.files[0]);

            console.log("user uploaded image", e.target.value);
            setOpen(true);
        }
    };

    return (
        <Dialog open={open}>
            <DialogTrigger asChild>
                <Input
                    name="image_url"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleOnChange}
                    className="hover:bg-input/50"
                    error={errors.image_url}
                />
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="">
                {/* <DialogTitle className="">Crop avatar</DialogTitle> */}
                {/* <DialogDescription></DialogDescription> */}
                <ImageCropper
                    crop={crop}
                    setCrop={setCrop}
                    completedCrop={completedCrop}
                    setCompletedCrop={setCompletedCrop}
                    imageSrc={imageSrc}
                    imageRef={imageRef}
                    maxHeight={100}
                />
                <Button onClick={() => saveImage(imageSrc, completedCrop)}>Save</Button>
            </DialogContent>
        </Dialog>
    );
}
