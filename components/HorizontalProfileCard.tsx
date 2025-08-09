import Loading from "./LoadingComponent";
import SkillTag from "./SkillTag";
import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Avatar from "./Avatar";

export default function HorizontalProfileCard({
    user,
    className,
}: {
    user: SafeUserType;
    className?: string;
} & React.ComponentPropsWithoutRef<"div">) {
    if (!user) return <Loading />;

    const hostname = user.domain?.replace(/^https?:\/\/(www\.)?/i, "");

    return (
        <Accordion
            type="single"
            collapsible
            className={cn(
                "w-full z-50 bg-card rounded-2xl shadow-md p-6 flex flex-row flex-wrap items-center justify-between gap-4 h-fit border",
                className
            )}
        >
            <AccordionItem value={String(user.ring_id)} className="w-full">
                <AccordionTrigger className="flex flex-row gap-6 w-full">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-between">
                        <div className="flex flex-row gap-6 items-center flex-wrap ">
                            <Avatar user={user} className="w-20 h-20" />

                            <div className="text-left">
                                <h2 className="font-semibold [font-size:clamp(1.5rem,2vw+1rem,2.25rem)]">
                                    {user.name}
                                </h2>
                                {user.graduation_year && user.program && (
                                    <p className="[font-size:clamp(0.875rem,1vw+0.5rem,1rem)]">
                                        {user.program} • {user.graduation_year}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right side: buttons */}
                        <div className="hidden sm:flex sm:flex-col flex-row gap-2 sm:gap-4 sm:items-center">
                            {user.domain && (
                                <LinkButton
                                    url={user.domain}
                                    text={hostname ?? user.domain}
                                    shortText="Portfolio"
                                    aria-label={`Open ${user.name}'s website`}
                                />
                            )}
                            {user.github_url && (
                                <LinkButton
                                    url={`https://github.com/${user.github_url}`}
                                    text={user.github_url}
                                    shortText="GitHub"
                                    aria-label={`Open ${user.name}'s GitHub`}
                                />
                            )}
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent className="flex flex-col gap-6">
                    {user.tagline && (
                        <p className="text-pretty [font-size:clamp(0.875rem,1vw+0.5rem,1rem)]">
                            {user.tagline}
                        </p>
                    )}

                    <div className="flex flex-row gap-2">
                        {user.tags?.map((tagName: string) => (
                            <SkillTag key={tagName} tagName={tagName} />
                        ))}
                    </div>
                    <div className="flex flex-row w-full m-0 sm:hidden gap-6">
                        {user.domain && (
                            <LinkButton
                                url={user.domain}
                                text={hostname ?? user.domain}
                                shortText="Portfolio"
                                aria-label={`Open ${user.name}'s website`}
                            />
                        )}
                        {user.github_url && (
                            <LinkButton
                                url={`https://github.com/${user.github_url}`}
                                text={user.github_url}
                                shortText="GitHub"
                                aria-label={`Open ${user.name}'s GitHub`}
                            />
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

export function LinkButton({
    url,
    text,
    shortText,
    className,
}: {
    url: string;
    text: string;
    shortText: string;
} & React.ComponentPropsWithoutRef<"button">) {
    const label = text.length <= 30 ? text : shortText ?? text;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cn(
                "w-max text-lg p-0",
                className,
                "text-primary underline-offset-4 hover:underline sm:hover:no-underline",
                "flex flex-row items-center justify-center gap-2"
            )}
        >
            <span className="sm:hidden capitalize">{shortText}</span>
            <span className="hidden sm:inline">{label}</span>
            <ExternalLink aria-hidden />
        </a>
    );
}
