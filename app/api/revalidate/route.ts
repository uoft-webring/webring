import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// This is the handler for the POST request sent by the Supabase webhook.
export async function POST(request: NextRequest) {
    // 1. Verify the secret token
    const authHeader = request.headers.get("authorization");
    const secret = process.env.REVALIDATION_SECRET_TOKEN;

    // Check if the secret is missing in your environment variables
    if (!secret) {
        console.error("REVALIDATION_SECRET_TOKEN is not set.");
        return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }

    // Check if the token from the header matches
    if (authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ message: "Unauthorized: Invalid token." }, { status: 401 });
    }

    // 2. Perform the revalidation
    try {
        // For this use case, we revalidate the home page.
        // You could also get the table/record from the webhook body to be more specific.
        revalidatePath("/");

        console.log("Successfully revalidated path: /");

        return NextResponse.json({
            revalidated: true,
            path: "/",
            now: Date.now(),
        });
    } catch (err) {
        console.error("Error during revalidation:", err);
        return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
    }
}
