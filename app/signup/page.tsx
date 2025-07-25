export const dynamic = "force-dynamic";

import CardForm from "@/components/CardForm";
import SignupForm from "./Form";
import { getCurrentUser } from "../dashboard/actions";
import { redirect } from "next/navigation";

export default async function SignUp() {
    const { user } = await getCurrentUser();

    if (user) {
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
