import { checkAddedCodeToPortfolio, getDomainValidity } from "../actions";
import StatusCard from "@/components/StatusCard";
import CodeSnippet from "@/components/CodeSnippet";
import Form from "next/form";
import RecheckButton from "@/components/RecheckButton";
import { getAuthUserProfile } from "@/app/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Status } from "@/components/StatusCard";
import next from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Join() {
    const { data: userData, error: userError } = await getAuthUserProfile();

    if (userError || !userData) {
        console.error("[Join] Error fetching user profile:", userError);
        redirect("/signup");
    }
    const validPortfolioStatus: Status = await getDomainValidity(); // Returns
    console.log("status", validPortfolioStatus);

    const id: number = userData.ring_id;

    const html = `<div style="display: 'flex'; align-items: 'center'; gap: '8px'">
    <a href='https://uoftwebring.com/redirect?nav=prev&id=${id}'>←</a>
    <a href='https://uoftwebring.com' target='_blank'>
    <img
            src='https://uoftwebring.com/ring_logo.svg'
            alt='UofT Webring'
            style="width: '24px'; height: 'auto'"
        />
    </a>
    <a href='https://uoftwebring.com/redirect?nav=next&id=${id}'>→</a>
</div>`;

    const react_and_tailwind = `<div className="flex items-center gap-2">
    <a href='https://uoftwebring.com/redirect?nav=prev&id=${id}'>←</a>
    <a href='https://uoftwebring.com' target='_blank'>
        <img
            src='https://uoftwebring.com/ring_logo.svg'
            alt='UofT Webring'
            className="w-6 h-auto"
        />
    </a>
    <a href='https://uoftwebring.com/redirect?nav=next&id=${id}'>→</a>
</div>`;

    const next_and_tailwind = `<div className="flex items-center gap-2">
    <a href='https://uoftwebring.com/redirect?nav=prev&id=${id}'>←</a>
    <a href='https://uoftwebring.com' target='_blank'>
        <Image
            src='https://uoftwebring.com/ring_logo.svg'
            alt='UofT Webring'
            height={24}
            width={24}
        />
    </a>
    <a href='https://uoftwebring.com/redirect?nav=next&id=${id}'>→</a>
</div>`;

    const codeStringMap = {
        "HTML & CSS": html,
        "React & Tailwind": react_and_tailwind,
        "NextJS & Tailwind": next_and_tailwind,
    };

    const action = async () => {
        "use server";
        // TODO: add this back in later when this is automated, going with manual process first
        const result = await checkAddedCodeToPortfolio();
    };

    return (
        <section>
            <h2>Join the commmunity</h2>
            <p className="mb-4">Copy the code and paste it into your portfolio to join the community.</p>

            <Tabs defaultValue="HTML & CSS" className="relative mr-auto flex w-full flex-col gap-6">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    {Object.keys(codeStringMap).map((value, index) => {
                        return (
                            <TabsTrigger
                                className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none "
                                key={index}
                                value={value}
                            >
                                {value}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
                {Object.entries(codeStringMap).map(([key, value], index) => {
                    return (
                        <TabsContent key={index} value={key}>
                            <CodeSnippet codeString={value} lang={key === "HTML & CSS" ? "html" : "jsx"} />
                        </TabsContent>
                    );
                })}
            </Tabs>

            <StatusCard showCTA={false} showButton={false} status={validPortfolioStatus} />
            {validPortfolioStatus == "disconnected" && (
                <Form action={action}>
                    <RecheckButton />
                </Form>
            )}

            {["pending", "connected"].includes(validPortfolioStatus) && (
                <div className="flex">
                    <Link href="/dashboard/verify" className="ml-auto">
                        <Button type="button">Continue</Button>
                    </Link>
                </div>
            )}
        </section>
    );
}
