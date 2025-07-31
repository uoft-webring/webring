import StatusCard from "@/components/StatusCard";
import RecheckButton from "@/components/RecheckButton";

import {
    checkDomainRecords,
    getDomainStatus,
    getTXTRecordValue,
    getUserProfile,
} from "../actions";
import { ExternalToast, toast } from "sonner";
import CodeSnippet from "@/components/CodeSnippet";

export default async function Verify() {
    // const data = await getRingProfile("get-profile");
    const { data: userData, error: userError } = await getUserProfile();

    const id: number = userData.ring_id;

    const domainTXTKey = "uoft-webring-" + id;
    const domainTXTValue = await getTXTRecordValue(String(id));

    const isVerified = await getDomainStatus();

    const action = async () => {
        "use server";
        const result = await checkDomainRecords();
        const options: ExternalToast = {
            position: "top-center",
        };

        if (result) {
            toast.success("Domain verified successfully!", options);
        } else {
            toast.error(
                "Domain verification failed. Please try again.",
                options
            );
        }
    };

    return (
        <>
            <h2>Verify your domain</h2>
            <p className="mb-4">
                To confirm that this domain belongs to you, add the TXT record
                shown below to your DNS records. When you're done, click “Verify
                Now.” We'll fetch your DNS and verify the domain automatically.
            </p>
            <h3>Key: </h3>
            {/* <pre className="flex items-center pl-2 pr-1 py-1 gap-2 hljs rounded-md mb-6 justify-between w-full">
                <code
                    className="rounded-xl block overflow-scroll"
                    dangerouslySetInnerHTML={{
                        __html: keyResult,
                    }}
                />
            </pre>{" "} */}
            <CodeSnippet codeString={domainTXTKey} />
            <h3>Value: </h3>
            {/* <pre className="flex items-center pl-2 pr-1 py-1 gap-2 hljs rounded-md mb-6 justify-between w-full">
                <code
                    className="rounded-xl block overflow-scroll"
                    dangerouslySetInnerHTML={{
                        __html: valueResult,
                    }}
                />
            </pre>{" "} */}
            <CodeSnippet codeString={domainTXTValue} />
            <StatusCard
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
