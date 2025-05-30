import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import domain_from_id from "./utils/middleware/domain_finder";

// e.g: https://ourdomain.com/redirect?nav=prev&id=0

export async function middleware(request: NextRequest) {
    // get webring domain
    const home_domain = process.env.HOME_DOMAIN!;

    // extracting search params
    const url = request.nextUrl.searchParams;
    const direction = url.get("nav");
    const idPram = url.get("id");
    console.log(direction, idPram);

    // null check and check if direction is next or prev
    if (!idPram || !direction || !["next", "prev"].includes(direction)) {
        // redirects to webring home page else continue to redirect page
        return home_domain != null
            ? NextResponse.redirect(new URL(home_domain))
            : NextResponse.next();
    }

    // process id in base 10
    const id = parseInt(idPram, 10);

    // id not valid number
    if (isNaN(id)) {
        // redirects to webring home page else continue to redirect page
        return home_domain != null
            ? NextResponse.redirect(new URL(home_domain))
            : NextResponse.next();
    }

    // call fcn to grab domain based on new id from db
    const domain = await domain_from_id(id, direction);
    console.log("domain", domain);
    if (!domain) {
        return home_domain != null
            ? NextResponse.redirect(new URL(home_domain))
            : NextResponse.next();
    }
    // redirect to domain from db
    return NextResponse.redirect(new URL(domain));
}

export const config = {
    matcher: "/redirect",
};
