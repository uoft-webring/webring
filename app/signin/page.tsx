import CardForm from "@/components/CardForm";
import SigninForm from "./Form";
import { getAuthUser } from "../dashboard/actions";
import { redirect } from "next/navigation";

export default async function Signin() {
    const { user } = await getAuthUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <CardForm cardTitle="Welcome back!">
            <SigninForm />
        </CardForm>
    );
}
