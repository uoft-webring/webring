import { getUserProfile } from "@/app/dashboard/actions";
import { unstable_cache } from "next/cache";

export const getRingProfile = unstable_cache(
    async (id: string) => {
        const { data, error } = await getUserProfile();
        if (data) {
            return data;
        } else {
            throw new Error("Failed to fetch user profile");
        }
    },
    ["get-profile"],
    { tags: ["profile"] }
);
