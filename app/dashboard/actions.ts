"server only";

import { User } from "@supabase/supabase-js";

export const checkDomainVerified = async (user: User) => {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 50);
    });

    return true;
};
