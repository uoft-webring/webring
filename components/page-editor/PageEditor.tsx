"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { updatePageContent } from "@/app/dashboard/actions";
import { PageHeader } from "@/components/dashboard/Panel";
import { Markdown } from "@/components/Markdown";
import { useAutosave } from "@/components/profile-editor/useAutosave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ACCENT_COLORS } from "@/lib/accents";
import { cn } from "@/lib/cn";
import { profilePath } from "@/lib/site";
import {
    ACCENTS,
    MAX_ABOUT_LENGTH,
    MAX_EXPERIENCE,
    MAX_LINKS,
    MAX_PROJECTS,
    pageContentSchema,
    pageFieldErrors,
    type CustomLink,
    type Experience,
    type PageContent,
    type Project,
} from "@/lib/validation";

const AUTOSAVE_DELAY_MS = 1000;
const DESCRIPTION_LIMIT = 280;

// Editor-only fields: a stable React key, and whether a role is ongoing (saved as an empty end month)
type Keyed<T> = T & { key: string };
type EditorExperience = Keyed<Experience> & { ongoing: boolean };
type EditorState = {
    about: string;
    accent: PageContent["accent"];
    projects: Keyed<Project>[];
    experience: EditorExperience[];
    links: Keyed<CustomLink>[];
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const STATUS_TEXT: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving…",
    saved: "All changes saved",
    error: "Couldn't save. We'll try again on your next change.",
};

// An invalid field blocks the whole save, so say so instead of showing the last save's status
const INVALID_TEXT = "Not saved yet. Fix the highlighted fields.";

function toEditorState(content: PageContent): EditorState {
    return {
        about: content.about,
        accent: content.accent,
        projects: content.projects.map((project) => ({ ...project, key: crypto.randomUUID() })),
        experience: content.experience.map((entry) => ({
            ...entry,
            key: crypto.randomUUID(),
            ongoing: !entry.end,
        })),
        links: content.links.map((link) => ({ ...link, key: crypto.randomUUID() })),
    };
}

// A just-added item nobody has typed into yet is a draft: not saved, and no errors shown for it
function isBlank(values: string[]): boolean {
    return values.every((value) => value.trim() === "");
}

function toContent(state: EditorState): PageContent {
    return {
        about: state.about,
        accent: state.accent,
        projects: state.projects
            .filter((project) => !isBlank([project.title, project.url, project.description]))
            .map(({ title, url, description }) => ({ title, url, description })),
        experience: state.experience
            .filter(
                (entry) =>
                    !isBlank([entry.role, entry.organization, entry.start, entry.end, entry.description])
            )
            .map(({ role, organization, start, end, description }) => ({
                role,
                organization,
                start,
                end,
                description,
            })),
        links: state.links
            .filter((link) => !isBlank([link.label, link.url]))
            .map(({ label, url }) => ({ label, url })),
    };
}

/** Errors keyed by the editor's item keys, so they follow an item when the list is reordered. */
function validate(state: EditorState): { errors: Record<string, string>; content: PageContent | null } {
    const content = toContent(state);
    const errors: Record<string, string> = {};
    const parsed = pageContentSchema.safeParse(content);

    if (!parsed.success) {
        const byPath = pageFieldErrors(parsed.error);
        const savedKeys = {
            projects: state.projects
                .filter((p) => !isBlank([p.title, p.url, p.description]))
                .map((p) => p.key),
            experience: state.experience
                .filter((e) => !isBlank([e.role, e.organization, e.start, e.end, e.description]))
                .map((e) => e.key),
            links: state.links.filter((l) => !isBlank([l.label, l.url])).map((l) => l.key),
        };
        for (const [path, message] of Object.entries(byPath)) {
            const [list, index, field] = path.split(".");
            const key = savedKeys[list as keyof typeof savedKeys]?.[Number(index)];
            errors[key && field ? `${key}.${field}` : path] = message;
        }
    }
    // An ongoing role is saved as an empty end month, so a finished role must have one
    for (const entry of state.experience) {
        if (!entry.ongoing && !entry.end && !isBlank([entry.role, entry.organization, entry.start])) {
            errors[`${entry.key}.end`] ??= "Pick an end month, or tick “I still work here”.";
        }
    }

    const valid = parsed.success && Object.keys(errors).length === 0;
    return { errors, content: valid ? parsed.data : null };
}

function move<T>(items: T[], from: number, to: number): T[] {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

function ItemControls({
    label,
    index,
    count,
    onMove,
    onRemove,
}: {
    label: string;
    index: number;
    count: number;
    onMove?: (to: number) => void;
    onRemove: () => void;
}): React.JSX.Element {
    const upRef = useRef<HTMLButtonElement>(null);
    const downRef = useRef<HTMLButtonElement>(null);

    // A move to either end disables the button just pressed, which would drop focus to <body>
    return (
        <div className="flex gap-1">
            {onMove && (
                <>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        ref={upRef}
                        onClick={() => {
                            if (index - 1 === 0) downRef.current?.focus();
                            onMove(index - 1);
                        }}
                        disabled={index === 0}
                        aria-label={`Move ${label} up`}
                    >
                        <ArrowUp aria-hidden />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        ref={downRef}
                        onClick={() => {
                            if (index + 1 === count - 1) upRef.current?.focus();
                            onMove(index + 1);
                        }}
                        disabled={index === count - 1}
                        aria-label={`Move ${label} down`}
                    >
                        <ArrowDown aria-hidden />
                    </Button>
                </>
            )}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                aria-label={`Remove ${label}`}
            >
                <Trash2 aria-hidden />
            </Button>
        </div>
    );
}

function SectionHeading({ id, title, hint }: { id: string; title: string; hint: string }): React.JSX.Element {
    return (
        <div className="mb-4">
            <h3 id={id} className="text-xl font-semibold">
                {title}
            </h3>
            <p className="text-muted-foreground text-sm">{hint}</p>
        </div>
    );
}

const itemClass = "border-border flex flex-col gap-3 rounded-xl border p-4";

/** Edits the member's public page. Changes autosave a second after the last edit, like the profile editor. */
export function PageEditor({
    initialContent,
    slug,
}: {
    initialContent: PageContent;
    slug: string;
}): React.JSX.Element {
    const [state, setState] = useState<EditorState>(() => toEditorState(initialContent));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<SaveStatus>("idle");
    const [aboutPreview, setAboutPreview] = useState(false);

    const autosave = useAutosave<PageContent>(async (content) => {
        setStatus("saving");
        const { error } = await updatePageContent(content).catch(() => ({ error: "unreachable" }));
        setStatus(error === null ? "saved" : "error");
    }, AUTOSAVE_DELAY_MS);

    const update = (next: EditorState) => {
        setState(next);
        const result = validate(next);
        setErrors(result.errors);
        if (result.content) autosave.schedule(result.content);
    };

    const patchItem = <K extends "projects" | "experience" | "links">(
        list: K,
        key: string,
        patch: Partial<EditorState[K][number]>
    ) => {
        update({
            ...state,
            [list]: (state[list] as EditorState[K][number][]).map((item) =>
                item.key === key ? { ...item, ...patch } : item
            ),
        });
    };

    const removeItem = (list: "projects" | "experience" | "links", key: string) => {
        update({ ...state, [list]: (state[list] as { key: string }[]).filter((item) => item.key !== key) });
        // The removed item took the focused button with it: hand focus to the section's Add button
        requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-add="${list}"]`)?.focus());
    };

    return (
        <section className="flex max-w-3xl flex-col gap-12">
            <div className="flex flex-col gap-2">
                <PageHeader
                    title="Customize your page"
                    description={
                        <>
                            Everything here appears on your public page.{" "}
                            <Link
                                href={profilePath(slug)}
                                className="text-foreground underline underline-offset-4"
                            >
                                View your page
                            </Link>
                        </>
                    }
                />
                <p role="status" aria-live="polite" className="text-muted-foreground min-h-5 text-sm">
                    {Object.keys(errors).length > 0 ? INVALID_TEXT : STATUS_TEXT[status]}
                </p>
            </div>

            <section aria-labelledby="about-heading">
                <SectionHeading
                    id="about-heading"
                    title="About"
                    hint="A longer introduction under your bio. Markdown works: **bold**, _italic_, [links](https://…), lists and headings."
                />
                <div className="mb-2 flex gap-2" role="group" aria-label="About editor mode">
                    <Button
                        type="button"
                        size="sm"
                        variant={aboutPreview ? "ghost" : "secondary"}
                        aria-pressed={!aboutPreview}
                        onClick={() => setAboutPreview(false)}
                    >
                        Write
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={aboutPreview ? "secondary" : "ghost"}
                        aria-pressed={aboutPreview}
                        onClick={() => setAboutPreview(true)}
                    >
                        Preview
                    </Button>
                </div>
                {aboutPreview ? (
                    <div
                        className="border-border min-h-48 rounded-md border p-4"
                        style={
                            { "--profile-accent": ACCENT_COLORS[state.accent].color } as React.CSSProperties
                        }
                    >
                        {state.about.trim() ? (
                            <Markdown className="text-muted-foreground">{state.about}</Markdown>
                        ) : (
                            <p className="text-muted-foreground text-sm">Nothing to preview yet.</p>
                        )}
                    </div>
                ) : (
                    <Textarea
                        id="about"
                        aria-labelledby="about-heading"
                        rows={10}
                        placeholder={
                            "I'm a second-year CS student who likes compilers and coffee.\n\n**Right now** I'm building…"
                        }
                        remaining={MAX_ABOUT_LENGTH - state.about.length}
                        value={state.about}
                        onChange={(event) => update({ ...state, about: event.target.value })}
                        error={errors.about}
                    />
                )}
            </section>

            <section aria-labelledby="projects-heading">
                <SectionHeading
                    id="projects-heading"
                    title="Projects"
                    hint={`Things you've built, in the order you want them shown. Up to ${MAX_PROJECTS}.`}
                />
                <ol className="flex flex-col gap-4">
                    {state.projects.map((project, index) => (
                        <li key={project.key} className={itemClass}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex w-full flex-col gap-2">
                                    <Label htmlFor={`${project.key}-title`}>Name</Label>
                                    <Input
                                        id={`${project.key}-title`}
                                        placeholder="UofT Webring"
                                        value={project.title}
                                        onChange={(e) =>
                                            patchItem("projects", project.key, { title: e.target.value })
                                        }
                                        error={errors[`${project.key}.title`]}
                                    />
                                </div>
                                <ItemControls
                                    label={project.title || "project"}
                                    index={index}
                                    count={state.projects.length}
                                    onMove={(to) =>
                                        update({ ...state, projects: move(state.projects, index, to) })
                                    }
                                    onRemove={() => removeItem("projects", project.key)}
                                />
                            </div>
                            <Label htmlFor={`${project.key}-url`}>Link (optional)</Label>
                            <Input
                                id={`${project.key}-url`}
                                type="url"
                                placeholder="https://github.com/you/project"
                                value={project.url}
                                onChange={(e) => patchItem("projects", project.key, { url: e.target.value })}
                                error={errors[`${project.key}.url`]}
                            />
                            <Label htmlFor={`${project.key}-description`}>What it does (optional)</Label>
                            <Textarea
                                id={`${project.key}-description`}
                                rows={2}
                                remaining={DESCRIPTION_LIMIT - project.description.length}
                                value={project.description}
                                onChange={(e) =>
                                    patchItem("projects", project.key, { description: e.target.value })
                                }
                                error={errors[`${project.key}.description`]}
                            />
                        </li>
                    ))}
                </ol>
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    data-add="projects"
                    disabled={state.projects.length >= MAX_PROJECTS}
                    onClick={() =>
                        update({
                            ...state,
                            projects: [
                                ...state.projects,
                                { key: crypto.randomUUID(), title: "", url: "", description: "" },
                            ],
                        })
                    }
                >
                    <Plus aria-hidden />
                    Add project
                </Button>
                {errors.projects && <p className="text-destructive mt-2 text-sm">{errors.projects}</p>}
            </section>

            <section aria-labelledby="experience-heading">
                <SectionHeading
                    id="experience-heading"
                    title="Experience"
                    hint={`Co-ops, jobs, research and clubs. Your page lists current roles first, then the most recent. Up to ${MAX_EXPERIENCE}.`}
                />
                <ol className="flex flex-col gap-4">
                    {state.experience.map((entry) => (
                        <li key={entry.key} className={itemClass}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="grid w-full gap-3 sm:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`${entry.key}-role`}>Role</Label>
                                        <Input
                                            id={`${entry.key}-role`}
                                            placeholder="Software Engineering Intern"
                                            value={entry.role}
                                            onChange={(e) =>
                                                patchItem("experience", entry.key, { role: e.target.value })
                                            }
                                            error={errors[`${entry.key}.role`]}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`${entry.key}-organization`}>Where</Label>
                                        <Input
                                            id={`${entry.key}-organization`}
                                            placeholder="Company, lab or club"
                                            value={entry.organization}
                                            onChange={(e) =>
                                                patchItem("experience", entry.key, {
                                                    organization: e.target.value,
                                                })
                                            }
                                            error={errors[`${entry.key}.organization`]}
                                        />
                                    </div>
                                </div>
                                <ItemControls
                                    label={entry.role || "role"}
                                    index={0}
                                    count={1}
                                    onRemove={() => removeItem("experience", entry.key)}
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor={`${entry.key}-start`}>Started</Label>
                                    <Input
                                        id={`${entry.key}-start`}
                                        type="month"
                                        value={entry.start}
                                        onChange={(e) =>
                                            patchItem("experience", entry.key, { start: e.target.value })
                                        }
                                        error={errors[`${entry.key}.start`]}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor={`${entry.key}-end`}>Ended</Label>
                                    <Input
                                        id={`${entry.key}-end`}
                                        type="month"
                                        value={entry.end}
                                        disabled={entry.ongoing}
                                        onChange={(e) =>
                                            patchItem("experience", entry.key, { end: e.target.value })
                                        }
                                        error={errors[`${entry.key}.end`]}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    id={`${entry.key}-ongoing`}
                                    type="checkbox"
                                    checked={entry.ongoing}
                                    onChange={(e) =>
                                        patchItem("experience", entry.key, {
                                            ongoing: e.target.checked,
                                            ...(e.target.checked && { end: "" }),
                                        })
                                    }
                                    className="accent-primary size-4 cursor-pointer"
                                />
                                <Label htmlFor={`${entry.key}-ongoing`} className="cursor-pointer">
                                    I still work here
                                </Label>
                            </div>
                            <Label htmlFor={`${entry.key}-description`}>What you did (optional)</Label>
                            <Textarea
                                id={`${entry.key}-description`}
                                rows={2}
                                remaining={DESCRIPTION_LIMIT - entry.description.length}
                                value={entry.description}
                                onChange={(e) =>
                                    patchItem("experience", entry.key, { description: e.target.value })
                                }
                                error={errors[`${entry.key}.description`]}
                            />
                        </li>
                    ))}
                </ol>
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    data-add="experience"
                    disabled={state.experience.length >= MAX_EXPERIENCE}
                    onClick={() =>
                        update({
                            ...state,
                            experience: [
                                ...state.experience,
                                {
                                    key: crypto.randomUUID(),
                                    role: "",
                                    organization: "",
                                    start: "",
                                    end: "",
                                    description: "",
                                    ongoing: false,
                                },
                            ],
                        })
                    }
                >
                    <Plus aria-hidden />
                    Add role
                </Button>
                {errors.experience && <p className="text-destructive mt-2 text-sm">{errors.experience}</p>}
            </section>

            <section aria-labelledby="links-heading">
                <SectionHeading
                    id="links-heading"
                    title="Links"
                    hint={`Shown with your website and GitHub: LinkedIn, a blog, your resume. Up to ${MAX_LINKS}.`}
                />
                <ol className="flex flex-col gap-3">
                    {state.links.map((link, index) => (
                        <li key={link.key} className="flex items-start gap-3">
                            <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor={`${link.key}-label`}>Label</Label>
                                    <Input
                                        id={`${link.key}-label`}
                                        placeholder="LinkedIn"
                                        value={link.label}
                                        onChange={(e) =>
                                            patchItem("links", link.key, { label: e.target.value })
                                        }
                                        error={errors[`${link.key}.label`]}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor={`${link.key}-url`}>URL</Label>
                                    <Input
                                        id={`${link.key}-url`}
                                        type="url"
                                        placeholder="https://linkedin.com/in/you"
                                        value={link.url}
                                        onChange={(e) =>
                                            patchItem("links", link.key, { url: e.target.value })
                                        }
                                        error={errors[`${link.key}.url`]}
                                    />
                                </div>
                            </div>
                            <div className="mt-7">
                                <ItemControls
                                    label={link.label || "link"}
                                    index={index}
                                    count={state.links.length}
                                    onMove={(to) => update({ ...state, links: move(state.links, index, to) })}
                                    onRemove={() => removeItem("links", link.key)}
                                />
                            </div>
                        </li>
                    ))}
                </ol>
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    data-add="links"
                    disabled={state.links.length >= MAX_LINKS}
                    onClick={() =>
                        update({
                            ...state,
                            links: [...state.links, { key: crypto.randomUUID(), label: "", url: "" }],
                        })
                    }
                >
                    <Plus aria-hidden />
                    Add link
                </Button>
                {errors.links && <p className="text-destructive mt-2 text-sm">{errors.links}</p>}
            </section>

            <fieldset>
                <legend className="text-xl font-semibold">Accent colour</legend>
                <p className="text-muted-foreground mb-4 text-sm">
                    Colours your photo ring, links and experience line. Named after Toronto transit lines.
                </p>
                <div className="flex flex-wrap gap-3">
                    {ACCENTS.map((accent) => (
                        <label
                            key={accent}
                            className={cn(
                                "border-border flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                                "has-checked:border-foreground has-checked:bg-secondary has-focus-visible:ring-ring has-focus-visible:ring-2"
                            )}
                        >
                            <input
                                type="radio"
                                name="accent"
                                value={accent}
                                checked={state.accent === accent}
                                onChange={() => update({ ...state, accent })}
                                className="sr-only"
                            />
                            <span
                                aria-hidden
                                className="size-4 rounded-full"
                                style={{ background: ACCENT_COLORS[accent].color }}
                            />
                            {ACCENT_COLORS[accent].label}
                        </label>
                    ))}
                </div>
            </fieldset>
        </section>
    );
}
