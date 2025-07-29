"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getDnsRecords } from "@layered/dns-records";
import { createHmac } from "crypto";
import { UserType } from "@/utils/zod";

// TODO: RLS to allow regular client to access this?
// TODO: Should be an issue since this is on the server
const client = createAdminClient();

// Here, we fetch the verification status of a user from supabase.
export const getDomainStatus = async (): Promise<boolean> => {
    const { data: userData, error: dataError } = await getUserInfo();

    if (!userData) {
        return false;
    }

    console.log(`Fetching verification status for user ID: ${userData.id}`);

    const { data, error } = await client
        .from("profile") // Select the 'profiles' table
        .select("is_verified") // We only need the 'is_verified' column
        .eq("id", userData.id); // Find the row where 'id' matches

    console.log(data);
    if (!data) {
        console.error("Error fetching verification status:", error.message);
        return false;
    }

    const userObject = data.at(0);
    if (userObject === undefined) {
        return false;
    }
    return userObject.is_verified as boolean;
};

export const getTXTRecordValue = async (userId: string): Promise<string> => {
    // Generate a secret-dependent deterministic TXT value from the user ID using a secret key
    // Increases security by preventing spoofing through ensuring only we can generate valid values
    return createHmac(
        "sha256",
        process.env.DOMAIN_VALIDATION_SECRET_KEY as string
    )
        .update(userId) // based on user ID
        .digest("base64url"); // safe for URL's
};

// Here we check whether the user has verified their domain or not from supabase.
export const checkDomainRecords = async (): Promise<boolean> => {
    const { data: userData, error: dataError } = await getUserInfo();

    if (dataError) {
        console.error("Error fetching user data:", dataError);
        return false;
    }

    let result: boolean = false;
    const domainURL: URL = new URL(userData.domain);
    const txtRecords = await getDnsRecords(domainURL.hostname, "TXT");
    const expectedTxtValue = await getTXTRecordValue(userData.id);

    console.log("Expected Username: " + "uoft-webring-" + userData.id);
    console.log("Expected Value: " + expectedTxtValue);
    for (const record of txtRecords) {
        if (
            record.name === "uoft-webring-" + userData.id &&
            record.data.includes(expectedTxtValue)
        ) {
            console.log("[CheckDomainRecords]: Domain Verified");
            result = true;
        }
        console.log(record);
    }

    if (result) {
        const { error } = await client
            .from("profile")
            .update({ is_verified: true })
            .eq("id", userData.id)
            .select();

        if (error) {
            console.error("Error updating domain verification status:", error);
            return false;
        }

        revalidatePath("/dashboard");
    }
    return result as boolean;
};

// Here we check whether the user has a valid portfolio or not from supabase.
export const checkAddedCodeToPortfolio = async (): Promise<boolean> => {
    const { data: userData, error: dataError } = await getUserInfo();

    if (dataError) {
        console.error("Error fetching user data:", dataError);
        return false;
    }

    // TODO: Replace this with actual domain verification logic.
    const result: boolean = true;

    if (result) {
        const { error } = await client
            .from("profile")
            .update({ valid: true })
            .eq("id", userData.id)
            .select();

        if (error) {
            console.error("Error updating domain verification status:", error);
            return false;
        }

        revalidatePath("/dashboard");
    }
    return result as boolean;
};

// Here we fetch the domain to see whether the user added the links on their page or not.
export const getValidPortfolio = async (): Promise<boolean> => {
    const { data: userData, error: dataError } = await getUserInfo();

    if (!userData) {
        return false;
    }

    console.log(`Fetching verification status for user ID: ${userData.id}`);

    const { data, error } = await client
        .from("profile") // Select the 'profiles' table
        .select("valid") // We only need the 'is_verified' column
        .eq("id", userData.id); // Find the row where 'id' matches

    console.log(data);
    if (!data) {
        console.error("Error fetching verification status:", error.message);
        return false;
    }

    const userObject = data.at(0);
    if (userObject === undefined) {
        return false;
    }
    return userObject.valid as boolean;
};
// TODO-J merge with getUserInfo
export const getCurrentUserDataForClient =
    async (): Promise<UserType | null> => {
        const { data: userData, error: dataError } = await getUserInfo();

        if (dataError) {
            console.error("Error fetching user data:", dataError);
            return null;
        }

        if (!userData) {
            return null;
        }

        // Return the user data
        return userData as UserType;
    };

export const getCurrentUser = async () => {
    const supabase = await createClient(); // Get the Supabase client instance

    const { data, error } = await supabase.auth.getUser();
    const user = data?.user || null; // Safely access user, default to null if data is null/undefined

    return { user, error };
};
// TODO-J merge with getCurrentUser
export const getUserInfo = async () => {
    const supabase = await createClient();
    const { user: authUser, error } = await getCurrentUser();
    if (!authUser) {
        redirect("/signup");
    }

    const { data: userData, error: dataError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", authUser.id);
    return {
        data: userData?.at(0) as UserType,
        error: dataError,
    };
};

export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    return redirect("/");
};
