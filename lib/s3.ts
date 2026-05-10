import "server-only";
import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serverEnv } from "@/lib/env";

// Cropped avatars are 512px AVIFs (usually < 100KB); anything near this is not a real avatar.
export const MAX_AVATAR_BYTES = 1024 * 1024;

let client: S3Client | undefined;

function s3(): S3Client {
    const env = serverEnv();
    client ??= new S3Client({
        region: env.AWS_REGION,
        credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
    });
    return client;
}

/** Avatar keys are prefixed with the owner's id so the server can tell whose upload a key is. */
export function isOwnedAvatarKey(imageKey: string, userId: string): boolean {
    return imageKey.startsWith(`${userId}_`);
}

/**
 * Presigned PUT for one avatar. Signing ContentLength makes S3 reject bodies of any other size,
 * which a plain presigned PUT would otherwise allow.
 */
export async function createAvatarUploadUrl(
    userId: string,
    contentLength: number
): Promise<{ uploadUrl: string; imageKey: string }> {
    const imageKey = `${userId}_${randomUUID()}.avif`;
    const command = new PutObjectCommand({
        Bucket: serverEnv().AWS_S3_BUCKET_NAME,
        Key: `avatars/${imageKey}`,
        ContentType: "image/avif",
        ContentLength: contentLength,
        CacheControl: "public, max-age=31536000, immutable",
        StorageClass: "INTELLIGENT_TIERING",
    });
    const uploadUrl = await getSignedUrl(s3(), command, {
        expiresIn: 300,
        signableHeaders: new Set(["content-type", "content-length"]),
    });
    return { uploadUrl, imageKey };
}

export async function deleteAvatar(imageKey: string): Promise<void> {
    await s3().send(new DeleteObjectCommand({ Bucket: serverEnv().AWS_S3_BUCKET_NAME, Key: `avatars/${imageKey}` }));
}
