import { getDomainValidity } from "../actions";
import StatusCard from "@/components/StatusCard";
import Form from "next/form";
import RecheckButton from "@/components/RecheckButton";
import { getAuthUserProfile } from "@/app/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Status } from "@/components/StatusCard";
import JoinCodeSnippets from "@/components/JoinCodeSnippets";

export default async function Join() {
    const { data: userData, error: userError } = await getAuthUserProfile();

    if (userError || !userData) {
        console.error("[Join] Error fetching user profile:", userError);
        redirect("/signup");
    }
    const validPortfolioStatus: Status = await getDomainValidity(); // Returns

    const id: number = userData.ring_id;

    const action = async () => {
        "use server";
        // TODO: add this back in later when this is automated, going with manual process first
        //const result = await checkAddedCodeToPortfolio();
    };

    return (
        <section>
            <h2>Join the community</h2>
            <p className="mb-4">Copy the code and paste it into your portfolio to join the community.</p>

            <JoinCodeSnippets id={id} />

            <StatusCard showCTA={false} showButton={false} status={validPortfolioStatus} />
            {validPortfolioStatus == "disconnected" && (
                <Form action={action}>
                    <RecheckButton />
                </Form>
            )}

            {["pending", "connected"].includes(validPortfolioStatus) && (
                <div className="flex">
                    <Link href="/dashboard/verify" className="ml-auto">
                        <Button type="button">Continue</Button>
                    </Link>
                </div>
            )}
        </section>
    );
}
