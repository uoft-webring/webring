"use server";
export const validateUrl = async (val: string) => {
    try {
        const url = new URL(val);

        // Only allow http and https protocols
        if (!["http:", "https:"].includes(url.protocol)) {
            return false;
        }

        // Block internal/private IPs and metadata endpoints
        const hostname = url.hostname.toLowerCase();
        const blocked = [
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            "169.254.169.254",
            "::1",
            "metadata.google.internal",
        ];
        if (
            blocked.includes(hostname) ||
            hostname.startsWith("10.") ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
            hostname.startsWith("192.168.") ||
            hostname.endsWith(".internal") ||
            hostname.endsWith(".local")
        ) {
            return false;
        }

        // Fetch without downloading the body
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const result = await fetch(val, {
            method: "HEAD",
            signal: controller.signal,
            redirect: "manual",
        });
        clearTimeout(timeout);
        // Accept 2xx and 3xx as "live"
        return result.status < 400;
    } catch {
        return false;
    }
};
