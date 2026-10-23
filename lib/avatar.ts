/** Public CloudFront URL for an uploaded avatar, or null when the member hasn't uploaded one. */
export function avatarUrl(imageKey: string): string | null {
    if (!imageKey) return null;
    return new URL(imageKey, `https://${process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN}/`).toString();
}
