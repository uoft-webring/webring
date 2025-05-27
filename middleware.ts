import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import domain_from_id from "./utils/middleware/domain_finder";

// https://ourdomain/redirect?nav=prev?id

export async function middleware(request: NextRequest) {
    // get webring domain
    const home_domain = process.env.HOME_DOMAIN;

    // extracting search params
    const url = request.nextUrl.searchParams;

    const direction = url.get("nav");

    const idPram = url.get("id");
    console.log(direction, idPram);
    // if no id
    if (!idPram) {
        if (home_domain != null)
            return NextResponse.redirect(new URL(home_domain));
        else return NextResponse.next();
        // redirects to webring home page else continue to redirect page
    }

    const id = parseInt(idPram, 10);

    // id not valid number
    if (isNaN(id)) {
        if (home_domain != null)
            return NextResponse.redirect(new URL(home_domain));
        else return NextResponse.next();
        // redirects to webring home page
    }

    let domain_id;
    // change id depending on direction
    if (direction == "next") {
        domain_id = id + 1;
    } else {
        domain_id = id - 1;
    }
    // call fcn to grab domain based on new id from db

    const domain = await domain_from_id(domain_id);

    if (!domain) {
        if (home_domain != null)
            return NextResponse.redirect(new URL(home_domain));
        else return NextResponse.next();
    }
    // redirect to domain from db
    return NextResponse.redirect(new URL(domain));
}

export const config = {
    matcher: "/redirect",
};
