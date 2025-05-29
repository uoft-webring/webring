"use server";

import { fetchProfilesForRing } from "./actions";
import { ClientRing } from "./ClientRing";

export default async function Ring() {
    return <ClientRing />;
}
