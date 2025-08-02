import {
    checkAddedCodeToPortfolio,
    getUserProfile,
    getValidPortfolio,
} from "../actions";
import StatusCard from "@/components/StatusCard";
import { ExternalToast, toast } from "sonner";
import CodeSnippet from "@/components/CodeSnippet";
import Form from "next/form";
import RecheckButton from "@/components/RecheckButton";

export default async function Join() {
    const { data: userData, error: userError } = await getUserProfile();

    const isValidPortfolio = await getValidPortfolio(userData);

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
        const result = await checkAddedCodeToPortfolio();
        const options: ExternalToast = {
            position: "top-center",
        };

        if (result) {
            toast.success("Domain verified successfully!", options);
        } else {
            toast.error(
                "Domain verification failed. Please try again.",
                options
            );
        }
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
                status={isValidPortfolio ? "connected" : "disconnected"}
            />
            {!isValidPortfolio && (
                <Form action={action}>
                    <RecheckButton />
                </Form>
            )}
        </section>
    );
}
