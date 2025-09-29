"use server";
export const validateUrl = async (val: string) => {
    try {
        // Fetch without downloading the body
        const result = await fetch(val, { method: "HEAD" });
        return result.ok;
    } catch {
        return false;
    }
};
