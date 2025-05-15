import "dotenv/config";
import { createClient } from "@/utils/supabase/client";

const insertData = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("profile").select("domain");

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Domain:", data);
    }

    const authobj = await supabase.auth.signInWithOtp({
        email: "abbasthethird@gmail.com",
        options: {
            shouldCreateUser: true,
            data: {
                //  attach user meta data
                name: "aloi",
                domain: "mohamaddamaj.com",
            },
            // emailRedirectTo: `${origin}/`,
        },
    });
};

insertData();
