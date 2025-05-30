"use server";

import React from "react";
import { getCurrentUser, getUserInfo } from "../dashboard/actions";
import { redirect } from "next/navigation";
import EditClient from "./edit";
import { UserType } from "@/utils/zod";

export default async function Edit() {
    const authUser = await getCurrentUser();
    const userData = await getUserInfo();

    if (!authUser) {
        redirect("/signup");
    }

    if (userData && userData.data) {
        return <EditClient data={userData.data} />;
    } else {
        return <div />;
    }
}
