"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getDnsRecords } from "@layered/dns-records";
import { createHmac } from "crypto";
import { UserType } from "@/utils/zod";

// TODO: RLS to allow regular client to access this?
// TODO: Should be an issue since this is on the server

// TODO-A @TheAmanM please rewrite function names and descriptions to make more sense
// Here, we fetch the verification status of a user from supabase.
/*
- fetch supabase and check if domain is verified
- fetches txt records to check if record exists
- fetches user data for user profile ?
- check if they added code to portfolio
*/
export const getDomainStatus = async (): Promise<boolean> => {
    const supabase = await createClient();

    const { data: userData, error: dataError } = await getUserProfile();

    if (!userData) {
        return false;
    }

    console.log(`Fetching verification status for user ID: ${userData.id}`);

    const { data, error } = await supabase
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
    const supabase = await createClient();

    const { data: userData, error: dataError } = await getUserProfile();

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
        const { error } = await supabase
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
    const supabase = await createClient();

    const { data: userData, error: dataError } = await getUserProfile();

    if (dataError) {
        console.error("Error fetching user data:", dataError);
        return false;
    }

    // TODO: Replace this with actual domain verification logic.
    const result: boolean = true;

    if (result) {
        const { error } = await supabase
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
export const getValidPortfolio = async (
    userData?: UserType
): Promise<boolean> => {
    const supabase = await createClient();

    if (!userData) {
        const { data: fetchedUserData, error: dataError } =
            await getUserProfile();
        if (!fetchedUserData) {
            return false;
        }
        userData = fetchedUserData;
    }

    console.log(`Fetching verification status for user ID: ${userData.id}`);

    const { data, error } = await supabase
        .from("profile")
        .select("valid")
        .eq("id", userData.id);

    console.log(data);
    if (!data) {
        console.error("Error fetching verification status:", error?.message);
        return false;
    }

    const userObject = data.at(0);
    return userObject?.valid === true;
};

export const getAuthUser = async () => {
    const supabase = await createClient(); // Get the Supabase client instance

    const { data, error } = await supabase.auth.getUser();
    const user = data?.user || null; // Safely access user, default to null if data is null/undefined

    return { user, error };
};

export const getUserProfile = async () => {
    const supabase = await createClient();

    const { data: userData, error: dataError } = await supabase
        .from("profile")
        .select("*");

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
