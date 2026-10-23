import type { Metadata } from "next";
import Link from "next/link";
import { CardForm } from "@/components/CardForm";
import { isValidUnsubscribeToken, unsubscribeParamsSchema } from "@/lib/unsubscribe";
import { UnsubscribeForm } from "./Form";

export const metadata: Metadata = {
    title: "Unsubscribe",
    robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
    const params = unsubscribeParamsSchema.safeParse(await searchParams);
    const valid = params.success && isValidUnsubscribeToken(params.data.kind, params.data.id, params.data.token);

    return (
        <CardForm
            cardTitle="Unsubscribe"
            cardDescription={valid ? "Stop getting emails from the UofT Webring?" : "This unsubscribe link is invalid."}
        >
            {valid ? (
                <UnsubscribeForm params={params.data} />
            ) : (
                <Link href="/" className="block text-center underline">
                    Back to the UofT Webring
                </Link>
            )}
        </CardForm>
    );
}
