import CardForm from "@/components/CardForm";
import SigninForm from "./Form";
import { getAuthUser } from "../dashboard/actions";
import { redirect } from "next/navigation";

export default async function Signin() {
    const { data: user } = await getAuthUser();

    if (user) {
        redirect("/dashboard/edit");
    }

    return (
        <CardForm cardTitle="Welcome back!">
            <SigninForm />
        </CardForm>
    );
}
