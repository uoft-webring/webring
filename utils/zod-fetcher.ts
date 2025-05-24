"use server";
export const validateUrl = async (val: string) => {
    console.log("Fetching", val);
    console.log("\n\n\n");
    try {
        const result = await fetch(val);
        console.log(result);
        return result.ok;
    } catch {
        return false;
    }
};
