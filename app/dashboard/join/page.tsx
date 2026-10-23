import Link from "next/link";
import { JoinCodeSnippets } from "@/components/dashboard/JoinCodeSnippets";
import { PageHeader, Panel } from "@/components/dashboard/Panel";
import { RingLinkCheck } from "@/components/dashboard/RingLinkCheck";
import { StatusCard } from "@/components/StatusCard";
import { Button } from "@/components/ui/button";
import { requireOwnProfile } from "@/lib/auth";
import { highlightMarkup } from "@/lib/highlight";
import { LOGO_COLORS, LOGO_FORMATS, widgetSnippets, type LogoColor, type Snippet } from "@/lib/join-snippets";

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
                {profile.ringStatus !== "connected" && <RingLinkCheck hasDomain={Boolean(profile.domain)} />}
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
