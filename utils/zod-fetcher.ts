"use server";
export const validateUrl = async (val: string) => {
    console.log("Fetching", val);
    console.log("\n\n\n");
    try {
        // Fetch without downloading the body
        const result = await fetch(val, { method: "HEAD" });
        console.log(result);
        return result.ok;
    } catch {
        return false;
    }
};
