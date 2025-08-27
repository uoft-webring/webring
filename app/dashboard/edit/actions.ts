"use server";

import { createClient } from "@/utils/supabase/server";
import { UserType } from "@/utils/zod";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { Crop, PixelCrop } from "react-image-crop";
import { WithImplicitCoercion } from "buffer";
import fetch, { RequestInfo } from "node-fetch";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 } from "uuid";

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
    } catch (e: any) {
        return { error: "Network error" };
    }
};

//KRISH CODE BELOW

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const generateUploadUrl = async () => {
    const uniqueId = v4();
    const s3Key = `avatars/${uniqueId}.avif`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        ContentType: "image/avif",
        StorageClass: "INTELLIGENT_TIERING",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour
    });

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return { presignedUrl, publicUrl };
};

/**
 * TODO-K: add AWS S3 Uploading
 *
 * Saves user cropped profile avatar into AWS S3 Bucket
 *
 * provision presigned url - change john code
 *
 *
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

    // return generateUploadUrl

    //return "data:image/avif;base64," + croppedBuffer.toString("base64");

    // Get presigned URL and public URL
    const { presignedUrl, publicUrl } = await generateUploadUrl();

    const uploadResult = await uploadToS3(presignedUrl, croppedBuffer, "image/avif");

    if (uploadResult.success) {
        return publicUrl;
    } else {
        return uploadResult;
    }
};

interface UploadResult {
    success: boolean;
    error?: string;
    publicUrl?: string;
}

const uploadToS3 = async (
    presignedUrl: string,
    file: Buffer<ArrayBufferLike>,
    contentType: string = "image/avif"
): Promise<UploadResult> => {
    try {
        const response = await fetch(presignedUrl, {
            method: "PUT",
            headers: {
                "Content-Type": contentType,
            },
            body: file,
        });

        if (response.ok) {
            console.log("Upload successful!");
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error("Upload failed:", response.status, response.statusText, errorText);
            return {
                success: false,
                error: `Upload failed: ${response.status} ${response.statusText} - ${errorText}`,
            };
        }
    } catch (error) {
        console.error("Error uploading to S3:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
};
