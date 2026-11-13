import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { requireAdmin } from "@/lib/admin";
import { EVERYONE } from "@/lib/email/audience";
import { emailConfig } from "@/lib/email/transport";
import { serverEnv } from "@/lib/env";
import { AdminNav } from "../../AdminNav";
import { Composer } from "../Composer";
import { loadComposerMembers } from "../data";

export const metadata: Metadata = { title: "New email", robots: { index: false } };

// Server actions run in this page's function: a send batch takes a few seconds
export const maxDuration = 60;

const STARTER = `Hi {{first_name}},

`;

export default async function NewEmailPage() {
    const admin = await requireAdmin();
    const members = await loadComposerMembers();

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={admin} />
            <main className="mx-auto w-full max-w-6xl px-6 pb-16">
                <AdminNav current="/admin/email" />
                <p className="mb-2 text-sm">
                    <Link href="/admin/email" className="text-muted-foreground underline-offset-4 hover:underline">
                        ← All emails
                    </Link>
                </p>
                <h1 className="mb-8">New email</h1>
                <Composer
                    initial={{ id: null, subject: "", body: STARTER, audience: EVERYONE }}
                    members={members}
                    self={{ name: admin.name, ringId: admin.ringId, slug: admin.slug, domain: admin.domain }}
                    sendingProblem={emailConfig().problem}
                    postalAddress={serverEnv().EMAIL_POSTAL_ADDRESS ?? null}
                />
            </main>
        </div>
    );
}
