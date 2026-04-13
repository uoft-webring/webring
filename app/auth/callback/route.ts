import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    const home = process.env.NEXT_PUBLIC_HOME_DOMAIN!;

    if (!token_hash || !type) {
        return NextResponse.redirect(new URL("/signup", home));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as "email" | "magiclink",
    });

    if (error) {
        console.error("Magic link verification failed:", error.message);
        return NextResponse.redirect(new URL("/signup?error=invalid_link", home));
    }

    return NextResponse.redirect(new URL("/dashboard/edit", home));
}
