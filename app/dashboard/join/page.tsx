import Link from "next/link";
import { JoinCodeSnippets } from "@/components/dashboard/JoinCodeSnippets";
import { PageHeader, Panel } from "@/components/dashboard/Panel";
import { RingLinkCheck } from "@/components/dashboard/RingLinkCheck";
import { StatusCard } from "@/components/StatusCard";
import { Button } from "@/components/ui/button";
import { requireOwnProfile } from "@/lib/auth";
import { highlightMarkup } from "@/lib/highlight";
import { LOGO_COLORS, LOGO_FORMATS, widgetSnippets, type LogoColor, type Snippet } from "@/lib/join-snippets";
import { isSiteDown } from "@/lib/profiles/ring";
import { getRingLinkState } from "@/lib/profiles/ring-link-state";
import { ringCheckMessage } from "@/lib/ring-link";

const checkedOn = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });

function allSnippets(ringId: number): Record<string, Snippet[]> {
    const result: Record<string, Snippet[]> = {};
    for (const format of LOGO_FORMATS) {
        for (const color of Object.keys(LOGO_COLORS) as LogoColor[]) {
            result[`${format}-${color}`] = widgetSnippets(ringId, format, color).map((snippet) => ({
                ...snippet,
                html: highlightMarkup(snippet.code),
            }));
        }
    }
    return result;
}

export default async function JoinPage() {
    const profile = await requireOwnProfile();
    const linkState = await getRingLinkState(profile.id);
    const siteDown = isSiteDown(linkState?.consecutiveDown ?? 0);

    return (
        <section className="flex flex-col gap-6">
            <PageHeader
                title="Join the community"
                description="Copy the code and paste it into your portfolio to join the community."
            />

            <Panel>
                <JoinCodeSnippets snippets={allSnippets(profile.ringId)} />
            </Panel>

            <StatusCard status={profile.ringStatus}>
                {linkState?.lastClickVerifiedAt ? (
                    <p className="text-muted-foreground text-sm">
                        Confirmed by visitors clicking your widget on{" "}
                        {checkedOn.format(linkState.lastClickVerifiedAt)}.
                    </p>
                ) : (
                    profile.ringStatus !== "connected" &&
                    linkState?.lastResult &&
                    linkState.lastCheckedAt && (
                        <p className="text-muted-foreground text-sm">
                            Last checked {checkedOn.format(linkState.lastCheckedAt)}:{" "}
                            {ringCheckMessage(linkState.lastResult, profile.ringId)}
                        </p>
                    )
                )}
                {siteDown && (
                    <p className="text-muted-foreground text-sm">
                        Your site didn&apos;t load on our last checks, so it&apos;s out of the ring for now.
                        Once it&apos;s back up, check it here to rejoin right away.
                    </p>
                )}
                {(profile.ringStatus !== "connected" || siteDown) && (
                    <RingLinkCheck hasDomain={Boolean(profile.domain)} />
                )}
            </StatusCard>

            {profile.ringStatus !== "disconnected" && (
                <div className="flex">
                    <Button asChild className="ml-auto">
                        <Link href="/dashboard/verify">Continue</Link>
                    </Button>
                </div>
            )}
        </section>
    );
}
