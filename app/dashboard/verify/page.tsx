import StatusCard from "@/components/StatusCard";

import { checkDomainRecords, checkMetaTagVerification, getDomainVerification, getTXTRecordValue } from "../actions";
import CodeSnippet from "@/components/CodeSnippet";
import { getAuthUserProfile } from "@/app/actions";
import { redirect } from "next/navigation";
import VerifyResult from "./VerifyResult";

export default async function Verify() {
    const { data: userData, error: userError } = await getAuthUserProfile();
    if (userError || !userData) {
        console.error("[Join] Error fetching user profile:", userError);
        redirect("/signup");
    }
    const id: number = userData.ring_id;

    const verificationValue = await getTXTRecordValue(String(id));

    const isVerified = await getDomainVerification();

    const dnsAction = async () => {
        "use server";
        const result = await checkDomainRecords();
        if (result) {
            redirect("/dashboard/verify");
        }
        return result;
    };

    const metaTagAction = async () => {
        "use server";
        const result = await checkMetaTagVerification();
        if (result) {
            redirect("/dashboard/verify");
        }
        return result;
    };

    const metaTagSnippet = `<meta name="uoft-webring" content="${verificationValue}" />`;

    return (
        <>
            <h2>Verify your domain</h2>
            <p className="mb-4">
                {isVerified
                    ? "Your domain is verified. Here are your verification records for reference."
                    : "To confirm that this domain belongs to you, choose one of the verification methods below."}
            </p>

            <StatusCard
                className="mt-4"
                status={isVerified ? "connected" : "unverified"}
                showButton={false}
                showCTA={false}
            />

            {/* DNS TXT record verification */}
            <h3 className="mt-6">{isVerified ? "DNS TXT Record" : "Option 1: DNS TXT Record"}</h3>
            <p className="mb-2 text-sm">
                Add the following TXT record to your DNS settings.
                {!isVerified && " We\u2019ll look it up automatically."}
            </p>
            <h4>Key:</h4>
            <CodeSnippet codeString={"uoft-webring"} />
            <h4 className="mt-4">Value:</h4>
            <CodeSnippet codeString={verificationValue} />
            {!isVerified && (
                <VerifyResult
                    action={dnsAction}
                    failureMessage="Verification failed. Please ensure your TXT record is correctly configured and DNS has propagated (this can take up to 48 hours)."
                />
            )}

            {/* Meta tag verification */}
            <h3 className="mt-8">{isVerified ? "HTML Meta Tag" : "Option 2: HTML Meta Tag"}</h3>
            <p className="mb-2 text-sm">
                {isVerified
                    ? "Alternatively, you can keep this meta tag in your homepage\u2019s "
                    : "If you can\u2019t edit your DNS records (e.g. GitHub Pages), add the following "}
                <code>&lt;meta&gt;</code> tag inside the <code>&lt;head&gt;</code>
                {isVerified ? "." : " of your site\u2019s homepage instead."}
            </p>
            <CodeSnippet codeString={metaTagSnippet} />
            {!isVerified && (
                <VerifyResult
                    action={metaTagAction}
                    buttonLabel="Verify via Meta Tag"
                    failureMessage="Verification failed. Please ensure the meta tag is present in the <head> of your homepage and try again."
                />
            )}
        </>
    );
}
