"use server";

import { createClient } from "@/utils/supabase/server";
import { UserType } from "@/utils/zod";
import { revalidatePath } from "next/cache";

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 } from "uuid";
import { redirect } from "next/navigation";
import { getAuthUserProfile } from "@/app/actions";

export const saveData = async (formData: UserType) => {
    try {
        const supabase = await createClient();
        const result = await supabase
            .from("profile") // Replace with your table name
            .update({
                name: formData.name,
                github_url: formData.github_url,
                image_key: formData.image_key,
                is_verified: formData.is_verified,
                tagline: formData.tagline,
                tags: formData.tags,
                domain: formData.domain,
                program: formData.program,
                graduation_year: formData.graduation_year,
                slug: formData.slug,
            })
            .eq("id", formData.id);

        if (!result.error) {
            revalidatePath("/");
        }
        // TODO make slug unique and check for violations
        return result;
    } catch (e: any) {
        return { error: "Network error" };
    }
};

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const requestPresignedUrl = async () => {
    const uniqueId = v4();
    const s3Key = `avatars/${uniqueId}.avif`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        ContentType: "image/avif",
        StorageClass: "INTELLIGENT_TIERING",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300, // 5 minutes
    });

    const objectKey = `${uniqueId}.avif`;
    return { presignedUrl, objectKey };
};

export const deletePreviousImage = async () => {
    // Obtain current user
    const { data, error } = await getAuthUserProfile();
    if (error || !data) {
        console.error("[deletePreviousImage] Error fetching authenticated user:", error);
        redirect("/login");
    }
    if (!data?.image_key) {
        // No previous image to delete
        return;
    }
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `avatars/${data.image_key}`,
    });
    try {
        await s3Client.send(command);
        console.log("[deletePreviousImage] Previous image deleted successfully");
    } catch (e) {
        console.error("[deletePreviousImage] Error deleting previous image:", e);
    }
};
