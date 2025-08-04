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
export const getTXTRecordValue = async (seed: any): Promise<string> => {
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
    const expectedKey = `uoft-webring-${user.ring_id}`;
    const fullRecordDomain = `${expectedKey}.${baseDomain}`;
    const expectedValue = await getTXTRecordValue(user.ring_id);
    try {
        console.log("Expected Domain: " + fullRecordDomain);
        console.log("Expected Value: " + expectedValue);

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
