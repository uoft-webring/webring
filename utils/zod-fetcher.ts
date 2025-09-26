"use server";
export const validateUrl = async (val: string) => {
    try {
        // Fetch without downloading the body
        const result = await fetch(val, { method: "HEAD" });
        console.log("Fetching", val, " with result: ", result.status, "\n");
        return result.ok;
    } catch {
        return false;
    }
};
