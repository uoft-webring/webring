import { CodeSnippet } from "@/components/CodeSnippet";
import { DomainVerificationCheck } from "@/components/dashboard/DomainVerificationCheck";
import { PageHeader, Panel } from "@/components/dashboard/Panel";
import { StatusCard } from "@/components/StatusCard";
import { requireOwnProfile } from "@/lib/auth";
import { SITE_CHECK_LIMIT } from "@/lib/rate-limit";
import { TXT_RECORD_NAME, txtRecordValue } from "@/lib/verification";

const fieldLabel = "text-muted-foreground text-sm font-medium";

export default async function VerifyPage() {
    const profile = await requireOwnProfile();
    const value = txtRecordValue(profile.ringId);

    return (
        <section className="flex flex-col gap-6">
            <PageHeader
                title="Verify your domain"
                description={
                    <>
                        To confirm that this domain belongs to you, add the TXT record shown below to your DNS
                        records. When you&apos;re done, click &quot;Verify Now.&quot; We&apos;ll fetch your
                        DNS and verify the domain automatically.
                    </>
                }
            />

            <Panel title="DNS TXT record">
                <div className="flex flex-col gap-2">
                    <h4 className={fieldLabel}>Key</h4>
                    <CodeSnippet code={TXT_RECORD_NAME} />
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className={fieldLabel}>Value</h4>
                    <CodeSnippet code={value} />
                </div>
            </Panel>

            <Panel
                title="Can't edit your DNS?"
                description={
                    <>
                        If your host doesn&apos;t let you add DNS records (e.g. GitHub Pages), add this tag
                        inside the <code>&lt;head&gt;</code> of your homepage instead, publish it, then click
                        &quot;Verify Now.&quot;
                    </>
                }
            >
                <CodeSnippet code={`<meta name="${TXT_RECORD_NAME}" content="${value}" />`} />
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                    <li>
                        We only check the homepage at the root of your domain (e.g. <code>you.github.io</code>
                        , not <code>you.github.io/portfolio</code>). Sites hosted on a path, like{" "}
                        <code>cs.toronto.edu/~you</code>, need the DNS record instead.
                    </li>
                    <li>
                        The tag must be in the HTML your server sends. Tags added by JavaScript, or streamed
                        into the page body by frameworks that render on request (some Next.js setups),
                        won&apos;t be seen.
                    </li>
                    <li>
                        You can check up to {SITE_CHECK_LIMIT.max} times an hour (this includes ring link
                        checks).
                    </li>
                </ul>
            </Panel>

            <StatusCard
                status={
                    profile.ringStatus !== "connected"
                        ? profile.ringStatus
                        : profile.isVerified
                          ? "connected"
                          : "unverified"
                }
            >
                {!profile.isVerified && <DomainVerificationCheck hasDomain={Boolean(profile.domain)} />}
            </StatusCard>
        </section>
    );
}
