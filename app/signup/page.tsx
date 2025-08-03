import CardForm from "@/components/CardForm";
import SignupForm from "./Form";
import { getAuthUser } from "../dashboard/actions";
import { redirect } from "next/navigation";

export default async function SignUp() {
    const { data: user } = await getAuthUser();

    // TODO; do we need this?
    if (user) {
        console.log("user session exists at sign up");
        redirect("/dashboard");
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
