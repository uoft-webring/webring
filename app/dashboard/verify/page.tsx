import StatusCard from "@/components/StatusCard";
import RecheckButton from "@/components/RecheckButton";

import { checkDomainRecords, getDomainVerification, getTXTRecordValue } from "../actions";
import CodeSnippet from "@/components/CodeSnippet";
import { getAuthUserProfile } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function Verify() {
    const { data: userData, error: userError } = await getAuthUserProfile();
    if (userError || !userData) {
        console.error("[Join] Error fetching user profile:", userError);
        redirect("/signup");
    }
    const id: number = userData.ring_id;

    const domainTXTValue = await getTXTRecordValue(String(id));

    const isVerified = await getDomainVerification();

    const action = async () => {
        "use server";
        const result = await checkDomainRecords();
        if (result) {
            // we want to trigger a UI refresh
            redirect("/dashboard/verify");
        }
    };

    return (
        <>
            <h2>Verify your domain</h2>
            <p className="mb-4">
                To confirm that this domain belongs to you, add the TXT record shown below to your DNS
                records. When you&apos;re done, click &quot;Verify Now.&quot; We&apos;ll fetch your DNS and
                verify the domain automatically.
            </p>

            <h3>Key: </h3>
            <CodeSnippet codeString={"uoft-webring"} />

            <h3 className="mt-4">Value: </h3>
            <CodeSnippet codeString={domainTXTValue} />
            <StatusCard
                className="mt-4"
                status={isVerified ? "connected" : "unverified"}
                showButton={false}
                showCTA={false}
            />
            {!isVerified && (
                <form action={action}>
                    <RecheckButton />
                </form>
            )}
        </>
    );
}
