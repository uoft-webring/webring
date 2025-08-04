import CardForm from "@/components/CardForm";
import SignupForm from "./Form";
import { getAuthUser } from "../dashboard/actions";
import { redirect } from "next/navigation";

export default async function SignUp() {
    const { data: user } = await getAuthUser();

    if (user) {
        console.log("user session exists at sign up");
        redirect("/dashboard/edit");
    }

    return (
        <CardForm
            cardTitle="Welcome"
            cardDescription="Enter your full name and your email to join the community."
        >
            <SignupForm />
        </CardForm>
    );
}
