import { checkAddedCodeToPortfolio, getDomainValidity } from "../actions";
import StatusCard from "@/components/StatusCard";
import { ExternalToast, toast } from "sonner";
import CodeSnippet from "@/components/CodeSnippet";
import Form from "next/form";
import RecheckButton from "@/components/RecheckButton";
import { getAuthUserProfile } from "@/app/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Status } from "@/components/StatusCard";

export default async function Join() {
    const { data: userData, error: userError } = await getAuthUserProfile();

    if (userError || !userData) {
        console.error("[Join] Error fetching user profile:", userError);
        redirect("/signup");
    }
    const validPortfolioStatus: Status = await getDomainValidity(); // Returns
    console.log("status", validPortfolioStatus);

    const id: number = userData.ring_id;

    const codeString = `<div style="display: 'flex'; align-items: 'center'; gap: '8px'">
    <a href='https://uoftwebring.com/redirect?nav=prev&id=${id}'>←</a>
    <a href='https://uoftwebring.com' target='_blank'>
        <img
            src='https://uoftwebring.com/ring_logo.svg'
            alt='UofT Webring'
            style="width: '24px'; height: 'auto'"
        />
    </a>
    <a href='https://uoftwebring.com/redirect?nav=next&id=${id}'>→</a>
</div>`;

    const action = async () => {
        "use server";
        // TODO: add this back in later when this is automated, going with manual process first
        const result = await checkAddedCodeToPortfolio();
        // const options: ExternalToast = {
        //     position: "top-center",
        // };

        // if (result) {
        //     toast.success("Domain verified successfully!", options);
        // } else {
        //     toast.error(
        //         "Domain verification failed. Please try again.",
        //         options
        //     );
        // }
    };

    return (
        <section>
            <h2>Join the commmunity</h2>
            <p className="mb-4">
                Copy the HTML code and paste it into your portfolio to join the
                community.
            </p>

            <CodeSnippet codeString={codeString} />

            <StatusCard
                showCTA={false}
                showButton={false}
                status={validPortfolioStatus}
            />
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
