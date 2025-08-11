import { Metadata } from "next";
import { redirect } from "next/navigation";
import { canLoadPage } from "./actions";
import OtpForm from "../../../components/OtpForm";

export const metadata: Metadata = {
    title: "Confirm sign-in",
    description: "Enter the one-time code sent to your email.",
};

// https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
export default async function Confirm({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const email = (await searchParams)?.email?.toString().toLowerCase().trim() || "";
    // Setup some redirect  logic
    if (!email) redirect("/");

    const validConfirmEmail = await canLoadPage(email);

    if (!validConfirmEmail) redirect("/");

    return <OtpForm email={email} />;
}
