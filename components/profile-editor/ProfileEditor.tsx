"use client";

import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";
import posthog from "posthog-js";
import { toast } from "sonner";
import { updateProfile } from "@/app/dashboard/actions";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toProfileInput } from "@/lib/profiles/mapper";
import type { OwnProfile } from "@/lib/profiles/types";
import {
    fieldErrors,
    MAX_TAGLINE_LENGTH,
    profileInputSchema,
    type ProfileErrors,
    type ProfileInput,
} from "@/lib/validation";
import { AvatarInput } from "./AvatarInput";
import { ProgramInput } from "./ProgramInput";
import { TagInput } from "./TagInput";
import { useAutosave } from "./useAutosave";

const AUTOSAVE_DELAY_MS = 1000;

type SaveStatus = "idle" | "saving" | "saved" | "error";

const requiredLabel = "after:text-destructive after:ml-1 after:content-['*']";

/**
 * Edits autosave a second after the last change. Each change is validated locally first so
 * invalid input shows inline instead of round-tripping; the server validates again regardless.
 */
export function ProfileEditor({ initialProfile }: { initialProfile: OwnProfile }): React.JSX.Element {
    const [values, setValues] = useState<ProfileInput>(() => toProfileInput(initialProfile));
    const [errors, setErrors] = useState<ProfileErrors>({});
    const [status, setStatus] = useState<SaveStatus>("idle");
    const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

    const persist = async (input: ProfileInput, explicit = false) => {
        setStatus("saving");
        const { error } = await updateProfile(input);
        if (error !== null) {
            setStatus("error");
            toast.error(error, { duration: 2000 });
            return;
        }
        setStatus("saved");
        if (!explicit) {
            toast.success("Your profile has been updated successfully!", { duration: 1000 });
            return;
        }
        posthog.capture("profile_saved", {
            has_domain: Boolean(input.domain),
            has_github: Boolean(input.githubUsername),
            has_tags: input.tags.length > 0,
        });
        toast.success("Your profile has been saved!", { duration: 1000 });
    };

    const autosave = useAutosave<ProfileInput>((input) => persist(input), AUTOSAVE_DELAY_MS);

    const validate = (input: ProfileInput) => {
        const parsed = profileInputSchema.safeParse(input);
        setErrors(parsed.success ? {} : fieldErrors(parsed.error));
        return parsed.success ? parsed.data : null;
    };

    const update = (patch: Partial<ProfileInput>) => {
        const next = { ...values, ...patch };
        setValues(next);
        const valid = validate(next);
        if (valid) autosave.schedule(valid);
    };

    const saveNow = async () => {
        const valid = validate(values);
        if (!valid) {
            toast.error("Please fix the errors before saving.", { duration: 2000 });
            return;
        }
        await autosave.flush();
        await persist(valid, true);
    };

    const preview = <ProfileCard profile={{ ...initialProfile, ...values }} />;

    const form = (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                void saveNow();
            }}
            className="flex flex-col"
            noValidate
        >
            <div className="gap-2 [&>*:not(label)]:mt-1 [&>*:not(label)]:mb-4">
                <Label htmlFor="name" className={requiredLabel}>
                    Name
                </Label>
                <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="John Doe"
                    required
                    value={values.name}
                    onChange={(e) => update({ name: e.target.value })}
                    error={errors.name}
                />
                <Label htmlFor="domain" className={requiredLabel}>
                    Portfolio Link
                </Label>
                <Input
                    id="domain"
                    name="domain"
                    type="url"
                    autoComplete="url"
                    placeholder="https://yourdomain.com"
                    required
                    value={values.domain}
                    onChange={(e) => update({ domain: e.target.value })}
                    error={errors.domain}
                />
                <div className="flex flex-row justify-evenly gap-2">
                    <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="graduationYear" className={requiredLabel}>
                            Graduation Year
                        </Label>
                        <Input
                            id="graduationYear"
                            name="graduationYear"
                            type="number"
                            inputMode="numeric"
                            placeholder="2029"
                            min={1900}
                            max={2100}
                            value={values.graduationYear ?? ""}
                            onChange={(e) => {
                                const year = e.currentTarget.valueAsNumber;
                                update({ graduationYear: Number.isNaN(year) ? null : year });
                            }}
                            error={errors.graduationYear}
                        />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="program" className={requiredLabel}>
                            Program
                        </Label>
                        <ProgramInput
                            id="program"
                            program={values.program ?? ""}
                            onProgramChange={(program) => update({ program: program || null })}
                        />
                        {errors.program && (
                            <p role="alert" className="text-destructive text-sm">
                                {errors.program}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-evenly gap-2">
                    <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="githubUsername">GitHub Username</Label>
                        <Input
                            id="githubUsername"
                            name="githubUsername"
                            placeholder="torvalds"
                            maxLength={39}
                            autoCapitalize="off"
                            spellCheck={false}
                            value={values.githubUsername}
                            onChange={(e) => update({ githubUsername: e.target.value })}
                            error={errors.githubUsername}
                        />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="slug" className="flex justify-between">
                            Slug
                            <Tooltip>
                                <TooltipTrigger type="button" aria-label="What is a slug?">
                                    <Info size={16} aria-hidden />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>This slug is used for your public profile, ex. uoftwebring.com/johndoe</p>
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <Input
                            id="slug"
                            name="slug"
                            placeholder="johndoe"
                            required
                            maxLength={40}
                            autoCapitalize="off"
                            spellCheck={false}
                            value={values.slug}
                            onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
                            error={errors.slug}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="openToWork"
                        name="openToWork"
                        type="checkbox"
                        checked={values.openToWork}
                        onChange={(e) => update({ openToWork: e.target.checked })}
                        className="accent-primary size-4 cursor-pointer"
                    />
                    <Label htmlFor="openToWork" className="cursor-pointer">
                        Open to co-op / internships
                    </Label>
                </div>
                <Label htmlFor="avatar">Profile picture</Label>
                <AvatarInput id="avatar" error={errors.imageKey} onUploaded={(imageKey) => update({ imageKey })} />
                <Label htmlFor="tags">Tags</Label>
                <TagInput tags={values.tags} onTagsChange={(tags) => update({ tags })} error={errors.tags} />
                <Label htmlFor="tagline">Bio</Label>
                <Textarea
                    id="tagline"
                    name="tagline"
                    placeholder="John Doe is a full stack..."
                    remaining={MAX_TAGLINE_LENGTH - values.tagline.length}
                    value={values.tagline}
                    onChange={(e) => update({ tagline: e.target.value })}
                    className="rounded-xl"
                    error={errors.tagline}
                />
                <p className="text-muted-foreground -mt-2 text-sm">
                    Want more than a line?{" "}
                    <Link href="/dashboard/page" className="text-foreground underline underline-offset-4">
                        Add an about section, projects and experience to your page
                    </Link>
                    .
                </p>
            </div>

            <div className="flex items-center justify-start gap-4">
                <Button variant="secondary" type="submit" disabled={status === "saving"}>
                    Save
                </Button>
                <Button asChild className="ml-auto">
                    <Link href="/dashboard/join">Continue</Link>
                </Button>
            </div>
        </form>
    );

    return (
        <>
            {/* The form is mounted once (no duplicate ids); on small screens the tabs swap it for the preview */}
            <Tabs
                value={mobileTab}
                onValueChange={(tab) => setMobileTab(tab as "edit" | "preview")}
                className="w-full lg:hidden"
            >
                <TabsList className="mb-2 grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                    <h2>Preview</h2>
                    <p className="mb-6">Preview your profile live, as you make changes.</p>
                    {preview}
                </TabsContent>
            </Tabs>
            <section
                className={cn(
                    "items-start justify-center gap-12 lg:flex lg:[&>*]:shrink lg:[&>*]:grow lg:[&>*]:basis-0",
                    mobileTab === "preview" ? "hidden" : "flex"
                )}
            >
                <div className="w-full">
                    <h2>Edit your profile</h2>
                    <p className="mb-6 lg:text-base">Complete the information below to complete your profile.</p>
                    {form}
                </div>
                <div className="justify-left hidden h-full flex-col items-start lg:flex">
                    <h2>Preview</h2>
                    <p className="mb-6 lg:text-base">Preview your profile live, as you make changes.</p>
                    {preview}
                </div>
            </section>
        </>
    );
}
