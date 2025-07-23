"use server";
import { UserType } from "@/utils/zod";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/utils/supabase/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserType } from "@/utils/zod";
import { User } from "@supabase/supabase-js";
import { getDnsRecords, getAllDnsRecords } from "@layered/dns-records";
import { createHmac } from "crypto";

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

// Here we check whether the user has verified their domain or not from supabase.
export const checkDomainRecords = async (): Promise<boolean> => {
    const { data: userData, error: dataError } = await getUserInfo();

    if (dataError) {
        console.error("Error fetching user data:", dataError);
        return false;
    }

    let result: boolean = false;
    const txtRecords = await getDnsRecords(userData.domain as string, "TXT");

    // Generate a secret-dependent deterministic TXT value from the user ID using a secret key
    // Increases security by preventing spoofing through ensuring only we can generate valid values
    const expectedTxtValue = createHmac(
        "sha256",
        process.env.NEXT_DOMAIN_VALIDATION_SECRET_KEY as string
    )
        .update(userData.id) // based on user ID
        .digest("base64url"); // safe for URL's

    for (const record of txtRecords) {
        if (
            record.name === "uoft-webring-" + userData.id &&
            record.data.includes(expectedTxtValue)
        ) {
            console.log("[CheckDomainRecords]: Domain Verified");
            result = true;
        }
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
    const result = await checkDomainRecords();

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
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    return { user, error };
};

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
    return redirect("/");
};
