import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import domain_from_id from "./utils/middleware/query";
// https://ourdomain/redirect?nav=prev?id
export async function middleware(request: NextRequest) {
    // extracting search params
    const url = request.nextUrl.searchParams;

    const direction = url.get("nav");

    const idPram = url.get("id");
    console.log(direction, idPram);
    // if no id
    if (!idPram) {
        return NextResponse.next();
        // keep the request going (we need to catch this i.e if the redirect doesnt go through we maybe redirect to home page of the webring or elsewhere)
    }

    const id = parseInt(idPram, 10);

    // id not valid number
    if (isNaN(id)) {
        return NextResponse.next(); // same as above
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
        return NextResponse.next(); // same as above
    }
    // redirect to domain from db
    return NextResponse.redirect(new URL(domain));
}

export const config = {
    matcher: "/redirect",
};
