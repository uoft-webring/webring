"use server";

import CardForm from "@/components/cardForm";
import SigninForm from "./form";
import { getCurrentUser } from "../dashboard-2/actions";
import { redirect } from "next/navigation";

export default async function Signin() {
    const { user } = await getCurrentUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <CardForm cardTitle="Welcome back!">
            <SigninForm />
        </CardForm>
    );
}
