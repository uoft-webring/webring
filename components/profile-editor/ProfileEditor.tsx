"use client";

import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";
import posthog from "posthog-js";
import { toast } from "sonner";
import { updateProfile } from "@/app/dashboard/actions";
import { PageHeader, Panel, TAB_TRIGGER_CLASS } from "@/components/dashboard/Panel";
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

const saveStatusText: Record<SaveStatus, string> = {
    idle: "Changes save automatically.",
    saving: "Saving…",
    saved: "All changes saved.",
    error: "Couldn't save. Try again.",
};

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

    const preview = (
        <ProfileCard profile={{ ...initialProfile, ...values }} className="mt-0" linked={false} />
    );

    const form = (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                void saveNow();
            }}
            className="flex flex-col"
            noValidate
        >
            <FormSection title="Basics" first>
                <Field>
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
                </Field>
                <Field>
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
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
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
                    </Field>
                    <Field>
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
                    </Field>
                </div>
            </FormSection>

            <FormSection title="About you">
                <Field>
                    <Label htmlFor="avatar">Profile picture</Label>
                    <AvatarInput
                        id="avatar"
                        error={errors.imageKey}
                        onUploaded={(imageKey) => update({ imageKey })}
                    />
                </Field>
                <Field className="[&_.text-muted]:text-muted-foreground">
                    <Label htmlFor="tagline">Bio</Label>
                    <Textarea
                        id="tagline"
                        name="tagline"
                        placeholder="John Doe is a full stack..."
                        remaining={MAX_TAGLINE_LENGTH - values.tagline.length}
                        value={values.tagline}
                        onChange={(e) => update({ tagline: e.target.value })}
                        error={errors.tagline}
                    />
                    <p className="text-muted-foreground text-sm">
                        Want more than a line?{" "}
                        <Link href="/dashboard/page" className="text-foreground underline underline-offset-4">
                            Add an about section, projects and experience to your page
                        </Link>
                        .
                    </p>
                </Field>
                <Field>
                    <Label htmlFor="tags">Tags</Label>
                    <TagInput
                        tags={values.tags}
                        onTagsChange={(tags) => update({ tags })}
                        error={errors.tags}
                    />
                </Field>
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
                        Open to internships
                    </Label>
                </div>
            </FormSection>

            <FormSection title="Links">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
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
                    </Field>
                    <Field>
                        <Label htmlFor="slug" className="flex justify-between">
                            Slug
                            <Tooltip>
                                <TooltipTrigger type="button" aria-label="What is a slug?">
                                    <Info size={16} aria-hidden />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        This slug is used for your public profile, ex. uoftwebring.com/johndoe
                                    </p>
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
                    </Field>
                </div>
            </FormSection>

            <div className="flex items-center gap-4 border-t pt-5">
                <p aria-live="polite" className="text-muted-foreground text-sm">
                    {saveStatusText[status]}
                </p>
                <Button variant="secondary" type="submit" disabled={status === "saving"} className="ml-auto">
                    Save
                </Button>
                <Button asChild>
                    <Link href="/dashboard/join">Continue</Link>
                </Button>
            </div>
        </form>
    );

    return (
        <section className="flex flex-col gap-6">
            <PageHeader
                title="Edit your profile"
                description="Complete the information below to complete your profile."
            />
            {/* The form is mounted once (no duplicate ids); on small screens the tabs swap it for the preview */}
            <Tabs
                value={mobileTab}
                onValueChange={(tab) => setMobileTab(tab as "edit" | "preview")}
                className="w-full xl:hidden"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit" className={TAB_TRIGGER_CLASS}>
                        Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" className={TAB_TRIGGER_CLASS}>
                        Preview
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="preview">{preview}</TabsContent>
            </Tabs>
            <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_25rem] xl:items-start xl:gap-8">
                <Panel className={cn(mobileTab === "preview" && "hidden xl:flex")}>{form}</Panel>
                <aside className="hidden flex-col gap-3 xl:sticky xl:top-6 xl:flex">
                    <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                        Preview
                    </p>
                    {preview}
                </aside>
            </div>
        </section>
    );
}

// Input/Textarea errors carry their own margins for the old stacked layout; the gap handles spacing here
function Field({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <div className={cn("flex flex-col gap-2 [&>[role=alert]]:m-0 [&>[role=alert]]:text-sm", className)}>
            {children}
        </div>
    );
}

function FormSection({
    title,
    first = false,
    children,
}: {
    title: string;
    first?: boolean;
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <fieldset className={cn("flex flex-col gap-4 pb-6", !first && "border-t pt-5")}>
            <legend className="sr-only">{title}</legend>
            <p aria-hidden className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                {title}
            </p>
            {children}
        </fieldset>
    );
}
