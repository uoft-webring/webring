"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createHmac } from "crypto";
import { ApiResponse, getAuthUserProfile } from "../actions";
import dns from "node:dns/promises";
import { User } from "@supabase/supabase-js";
import { Status } from "@/components/StatusCard";

/**
 * There is a clear distinction between domain vailidity and verification
 * - Validity: Whether the user has added the code to their portfolio
 * - Verification: Whether the user has verified their domain ownership through DNS records
 */

/**
 * Only returns the domain verification *status* of the currently authenticated user.
 *
 * Checks if the user is verified by fetching the `is_verified` field in profile's table
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if the domain is verified, otherwise `false`.
 * @throws {Error} If there is an error fetching the user profile or verification status.
 */
export const getDomainVerification = async (): Promise<boolean> => {
    const supabase = await createClient();

    // First obtain the ID of the currently authenticated user
    const { data: user, error: userError } = await getAuthUserProfile();
    if (!user || userError) return false;

    console.log(`Fetching verification status for user ID: ${user.id}`);

    const { data, error } = await supabase
        .from("profile") // Select the 'profiles' table
        .select("is_verified") // We only need the 'is_verified' column
        .eq("id", user.id) // Find the row where 'id' matches
        .single();

    if (error || !data) {
        console.error("Error fetching verification status:", error.message);
        return false;
    }

    return Boolean(data.is_verified);
};

/**
 * Returns the TXT record value for domain verification.
 *
 * Generates a deterministic value based on the user's ID and a secret key.
 *
 * @returns {Promise<string>} A promise that resolves to the TXT record value.
 * @throws {Error} If the secret key is not set in the environment variables.
 * @param {string} userId - The ID of the user to generate the TXT record value for.
 */
export const getTXTRecordValue = async (seed: string): Promise<string> => {
    // Generate a secret-dependent deterministic TXT value from the user ID using a secret key
    // Increases security by preventing spoofing through ensuring only we can generate valid values
    if (!process.env.DOMAIN_VALIDATION_SECRET_KEY) {
        throw new Error("DOMAIN_VALIDATION_SECRET_KEY is not set in environment variables.");
    }
    return createHmac("sha256", process.env.DOMAIN_VALIDATION_SECRET_KEY as string)
        .update(String(seed)) // based on seed
        .digest("base64url"); // safe for URL's
};

/**
 * Returns whether the user has verified their domain or not *based on their TXT records*.
 *
 * Fetches the TXT records for the user's domain and checks if the expected TXT record exists.
 * If the expected TXT record is found, it updates the user's profile to mark them as verified.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if the domain is verified, otherwise `false`.
 * @throws {Error} If there is an error fetching the user profile or updating the verification status.
 */
export const checkDomainRecords = async (): Promise<boolean> => {
    const supabase = await createClient();

    const { data: user, error: userError } = await getAuthUserProfile();
    if (!user || userError) {
        console.error("Error fetching user data:", userError);
        return false;
    }

    const baseDomain = new URL(user.domain).hostname;
    const expectedKey = `uoft-webring`;
    const fullRecordDomain = `${expectedKey}.${baseDomain}`;
    const expectedValue = await getTXTRecordValue(String(user.ring_id));
    try {
        const records = await dns.resolveTxt(fullRecordDomain);
        const flatRecords = records.map((entry) => entry.join(""));

        const matched = flatRecords.includes(expectedValue);

        if (!matched) {
            console.warn("No matching TXT record found for key and value.");
            return false;
        }

        const { error: updateError } = await supabase
            .from("profile")
            .update({ is_verified: true })
            .eq("id", user.id)
            .select();

        if (updateError) {
            console.error("Error updating verification status:", updateError);
            return false;
        }

        revalidatePath("/dashboard");
        return true;
    } catch (err) {
        console.error("Unexpected error during domain verification:", err);
        return false;
    }
};

/**
 * Returns whether the user has verified their domain via a meta tag.
 *
 * Fetches the HTML at the user's domain and checks for:
 *   <meta name="uoft-webring" content="<expectedValue>" />
 * If found, it updates the user's profile to mark them as verified.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if the meta tag is found and valid, otherwise `false`.
 */
export const checkMetaTagVerification = async (): Promise<boolean> => {
    const { data: user, error: userError } = await getAuthUserProfile();
    if (!user || userError) {
        console.error("Error fetching user data:", userError);
        return false;
    }

    const expectedValue = await getTXTRecordValue(String(user.ring_id));

    try {
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(user.domain);
        } catch {
            console.warn("Invalid domain URL:", user.domain);
            return false;
        }
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            console.warn("Domain URL must use http or https:", user.domain);
            return false;
        }

        // Block requests to private/internal IPs to prevent SSRF
        const hostname = parsedUrl.hostname;
        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "::1" ||
            hostname === "0.0.0.0" ||
            hostname.endsWith(".local") ||
            hostname.endsWith(".internal") ||
            /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname)
        ) {
            console.warn("Domain points to a private/internal address:", hostname);
            return false;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10_000);
        const response = await fetch(user.domain, {
            signal: controller.signal,
            redirect: "follow",
            headers: { "User-Agent": "uoft-webring-verifier/1.0" },
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            console.warn(`Failed to fetch domain (${response.status}): ${user.domain}`);
            return false;
        }

        // Validate the final URL after any redirects is still http/https
        const finalUrl = new URL(response.url);
        if (finalUrl.protocol !== "http:" && finalUrl.protocol !== "https:") {
            console.warn("Redirect led to non-http(s) URL:", response.url);
            return false;
        }

        // Only read the first 1MB — the meta tag will be in <head>, no need for more
        const MAX_BODY_SIZE = 1024 * 1024;
        const reader = response.body?.getReader();
        if (!reader) {
            console.warn("Could not read response body for:", user.domain);
            return false;
        }
        const chunks: Uint8Array[] = [];
        let totalSize = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            totalSize += value.byteLength;
            if (totalSize > MAX_BODY_SIZE) {
                chunks.push(value.slice(0, value.byteLength - (totalSize - MAX_BODY_SIZE)));
                reader.cancel();
                break;
            }
            chunks.push(value);
        }
        const html = new TextDecoder().decode(
            chunks.reduce((acc, chunk) => {
                const merged = new Uint8Array(acc.length + chunk.length);
                merged.set(acc);
                merged.set(chunk, acc.length);
                return merged;
            }, new Uint8Array()),
        );

        // Match <meta name="uoft-webring" content="..."> with attributes in any order,
        // tolerating extra whitespace and additional attributes.
        const metaTagRegex =
            /<meta\b[^>]*\bname=["']uoft-webring["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i;
        const reverseMetaTagRegex =
            /<meta\b[^>]*\bcontent=["']([^"']*)["'][^>]*\bname=["']uoft-webring["'][^>]*>/i;

        const match = metaTagRegex.exec(html) ?? reverseMetaTagRegex.exec(html);

        if (!match || match[1] !== expectedValue) {
            console.warn("No matching meta tag found for uoft-webring verification.");
            return false;
        }

        const supabase = await createClient();
        const { error: updateError } = await supabase
            .from("profile")
            .update({ is_verified: true })
            .eq("id", user.id)
            .select();

        if (updateError) {
            console.error("Error updating verification status:", updateError);
            return false;
        }

        revalidatePath("/dashboard");
        return true;
    } catch (err) {
        console.error("Unexpected error during meta tag verification:", err);
        return false;
    }
};

//---------------------- DOMAIN VALIDITY ----------------------

/**
 * Only returns the domain validation *status* of the currently authenticated user.
 *
 * Checks if the user has validated their domain by fetching the `valid` field in profile's table
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if the domain is valid, otherwise `false`.
 * @throws {Error} If there is an error fetching the user profile or validation status.
 * @param {UserType} [user] - Optional user data. If not provided, it will be fetched.

 */ export const getDomainValidity = async (): Promise<Status> => {
    const supabase = await createClient();

    // if (!user) {
    //     const { data, error } = await getAuthUserProfile();
    //     if (error || !data) {
    //         console.error("Failed to fetch authenticated user profile:", error);
    //         return false;
    //     }
    //     user = data;
    // }

    // console.log(`Fetching verification status for user ID: ${user.id}`);

    const { data, error } = await supabase.from("profile").select("validated_user_component").single();

    console.log(data);
    if (error || !data) {
        console.error("Error fetching domain validation status:", error.message);
        return "disconnected"; // equivalent to default false status
    }

    return data?.validated_user_component;
};

// Here we check whether the user has a valid portfolio or not from supabase.
export const checkAddedCodeToPortfolio = async (): Promise<boolean> => {
    const supabase = await createClient();

    const { data: userData, error: dataError } = await getAuthUserProfile();

    if (dataError) {
        console.error("Error fetching user data:", dataError);
        return false;
    }

    // fetch initial user validate_user_component state
    // TODO: fix typescript typing warning
    if (userData?.validated_user_component !== "pending") {
        const { error } = await supabase
            .from("profile")
            .update({ validated_user_component: "pending" })
            .eq("id", userData?.id)
            .select();

        if (error) {
            console.error("Error updating domain verification status:", error);
            return false;
        }
        revalidatePath("/dashboard");
    }

    // TODO: Replace this with actual domain verification logic.
    const result: boolean = false; // this will be an api check
    //TODO need to write code to make a request in the DB
    if (result) {
        const { error } = await supabase
            .from("profile")
            .update({ validated_user_component: "connected" })
            .eq("id", userData?.id)
            .select();

        if (error) {
            console.error("Error updating domain verification status:", error);
            return false;
        }

        revalidatePath("/dashboard");
    }
    return result as boolean;
};

/**
 * Retrieves the currently authenticated user using the Supabase client
 * from the Authentication table.
 *
 * @returns {Promise<ApiResponse<User>>} A response object containing the
 * authenticated user in `data` if successful, or an error message in `error`
 * if the operation fails.
 */
export const getAuthUser = async (): Promise<ApiResponse<User>> => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        return {
            data: null,
            error: error?.message ?? "User not found.",
        };
    }

    return {
        data: data.user,
        error: null,
    };
};

export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    return redirect("/");
};
