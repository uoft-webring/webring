"use server";

import { createClient } from "@/utils/supabase/server";
import { UserType } from "@/utils/zod";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { Crop, PixelCrop } from "react-image-crop";
import { WithImplicitCoercion } from "buffer";

export const saveData = async (formData: UserType) => {
    try {
        const supabase = await createClient();
        const result = await supabase
            .from("profile") // Replace with your table name
            .update({
                name: formData.name,
                github_url: formData.github_url,
                image_url: formData.image_url,
                is_verified: formData.is_verified,
                tagline: formData.tagline,
                tags: formData.tags,
                domain: formData.domain,
                program: formData.program,
                graduation_year: formData.graduation_year,
            })
            .eq("id", formData.id);

        if (!result.error) {
            revalidatePath("/");
        }

        return result;
    } catch (e) {
        return { error: "Network error" };
    }
};

/**
 * TODO-K: add AWS S3 Uploading
 *
 * Saves user cropped profile avatar into AWS S3 Bucket
 *
 * @param {imageSrc} image source represented in base64 format
 * @param {completedCrop} completedCrop based on PixelCrop from react-easy-crop
 * @param {scaleX} scale of client side image width to actual image width
 * @param {scaleY}scale of client side image height to actual image height
 * @returns cropped image represented in base64 format
 */
export const saveCroppedImaged = async (
    imageSrc: string,
    completedCrop: PixelCrop,
    scaleX: number,
    scaleY: number
) => {
    // Only take the base64 data portion from client side base64 encoded string
    // Since FileReader returns a string that looks like data:image/png;base64,{image data}
    // We only want image data part of encoded string
    const uri: WithImplicitCoercion<string> = imageSrc.split(";base64,").pop() || "";
    const croppedBuffer = await sharp(Buffer.from(uri, "base64"))
        .extract({
            left: Math.floor(completedCrop.x * scaleX),
            top: Math.floor(completedCrop.y * scaleY),
            width: Math.floor(completedCrop.width * scaleX),
            height: Math.floor(completedCrop.height * scaleY),
        })
        .avif({ quality: 30 })
        .toBuffer();

    // TODO-K: HERE SHOULD RETURN AWS S3 LINK
    return "data:image/avif;base64," + croppedBuffer.toString("base64");
};
