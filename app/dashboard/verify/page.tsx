import { CodeSnippet } from "@/components/CodeSnippet";
import { DomainVerificationCheck } from "@/components/dashboard/DomainVerificationCheck";
import { StatusCard } from "@/components/StatusCard";
import { requireOwnProfile } from "@/lib/auth";
import { TXT_RECORD_NAME, txtRecordValue } from "@/lib/verification";

export default async function VerifyPage() {
    const profile = await requireOwnProfile();

    return (
        <>
            <h2>Verify your domain</h2>
            <p className="mb-4">
                To confirm that this domain belongs to you, add the TXT record shown below to your DNS records.
                When you&apos;re done, click &quot;Verify Now.&quot; We&apos;ll fetch your DNS and verify the domain
                automatically.
            </p>

            <h3>Key: </h3>
            <CodeSnippet code={TXT_RECORD_NAME} />

            <h3 className="mt-4">Value: </h3>
            <CodeSnippet code={txtRecordValue(profile.ringId)} />
            <StatusCard className="mt-4" status={profile.isVerified ? "connected" : "unverified"} />
            {!profile.isVerified && <DomainVerificationCheck hasDomain={Boolean(profile.domain)} />}
        </>
    );
}
