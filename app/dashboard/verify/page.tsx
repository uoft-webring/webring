import { CodeSnippet } from "@/components/CodeSnippet";
import { DomainVerificationCheck } from "@/components/dashboard/DomainVerificationCheck";
import { StatusCard } from "@/components/StatusCard";
import { requireOwnProfile } from "@/lib/auth";
import { TXT_RECORD_NAME, txtRecordValue } from "@/lib/verification";

export default async function VerifyPage() {
    const profile = await requireOwnProfile();
    const value = txtRecordValue(profile.ringId);

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
            <CodeSnippet code={value} />

            <h3 className="mt-6">Can&apos;t edit your DNS?</h3>
            <p className="mb-4">
                If your host doesn&apos;t let you add DNS records (e.g. GitHub Pages), add this tag inside the{" "}
                <code>&lt;head&gt;</code> of your homepage instead, publish it, then click &quot;Verify Now.&quot;
            </p>
            <CodeSnippet code={`<meta name="${TXT_RECORD_NAME}" content="${value}" />`} />
            <StatusCard className="mt-4" status={profile.isVerified ? "connected" : "unverified"} />
            {!profile.isVerified && <DomainVerificationCheck hasDomain={Boolean(profile.domain)} />}
        </>
    );
}
