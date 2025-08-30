import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import domain_from_id from "./utils/middleware/domain_finder";

// e.g: https://ourdomain.com/redirect?nav=prev&id=0

export async function middleware(request: NextRequest) {
    // Our domain differs depending on localhost vs prod
    const home_domain = process.env.HOME_DOMAIN!;

    const redirect = () =>
        home_domain != null ? NextResponse.redirect(new URL(home_domain)) : NextResponse.next();
    // extracting search params
    const url = request.nextUrl.searchParams;
    const directionParam = url.get("nav") as "next" | "prev" | null;
    const idParam = url.get("id");

    // Normalize and validate params + check if direction is next or prev
    if (!idParam || !directionParam || !["next", "prev"].includes(directionParam)) {
        // if any of the data is bad, just redirect to home page or go to redirect page
        return redirect();
    }

    // process id in base 10
    const id = parseInt(idParam, 10);

    // Validate ID
    if (isNaN(id)) {
        return redirect();
    }

    // call fcn to grab domain based on new id from db
    const domain = await domain_from_id(id, directionParam);
    if (!domain) {
        return redirect();
    }
    // redirect to domain from db
    return NextResponse.redirect(new URL(domain));
}

export const config = {
    matcher: "/redirect",
};