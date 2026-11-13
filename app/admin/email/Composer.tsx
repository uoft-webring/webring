"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    describeAudience,
    matchesAudience,
    RING_STATUSES,
    SITE_FILTERS,
    type Audience,
    type SiteFilter,
} from "@/lib/email/audience";
import {
    MAX_BODY_LENGTH,
    MAX_SUBJECT_LENGTH,
    MERGE_FIELDS,
    renderEmail,
    unknownMergeFields,
    type EmailRecipient,
    type MergeFieldName,
} from "@/lib/email/format";
import { deleteDraftAction, saveDraft, sendTestEmail, startSendingAction } from "./actions";
import type { ComposerMember } from "./types";
import { progressOf, useSending } from "./useSending";

type Draft = { id: string | null; subject: string; body: string; audience: Audience };

type Props = {
    initial: Draft;
    members: ComposerMember[];
    /** The admin's own member record: the default preview and who test sends go to. */
    self: EmailRecipient;
    sendingProblem: string | null;
    postalAddress: string | null;
};

const OPEN_TO_WORK = { any: "Anyone", yes: "Open to work", no: "Not open to work" } as const;
type OpenToWorkChoice = keyof typeof OPEN_TO_WORK;

function parseRingIds(value: string): number[] {
    return [...new Set(value.split(/[\s,]+/).filter((part) => /^\d{1,9}$/.test(part)).map(Number))];
}

export function Composer({ initial, members, self, sendingProblem, postalAddress }: Props): React.JSX.Element {
    const router = useRouter();
    const [draft, setDraft] = useState<Draft>(initial);
    const [ringIdsText, setRingIdsText] = useState(initial.audience.ringIds.join(", "));
    const [saved, setSaved] = useState<Draft>(initial);
    const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
    const [pending, startTransition] = useTransition();
    const [confirming, setConfirming] = useState(false);
    const [previewRingId, setPreviewRingId] = useState<number | null>(null);
    const body = useRef<HTMLTextAreaElement>(null);
    const sending = useSending();

    const audience = draft.audience;
    const matching = members.filter((member) => matchesAudience(member, audience));
    const recipients = matching.filter((member) => member.reachable);
    const leftOut = matching.length - recipients.length;
    const unknown = unknownMergeFields(`${draft.subject}\n${draft.body}`);
    const dirty = JSON.stringify(draft) !== JSON.stringify(saved) || draft.id === null;
    const complete = draft.subject.trim() !== "" && draft.body.trim() !== "" && unknown.length === 0;
    const years = [...new Set(members.map((member) => member.graduationYear).filter((year): year is number => year !== null))].sort();

    const previewMember = recipients.find((member) => member.ringId === previewRingId)?.recipient ?? self;
    const preview = renderEmail(draft, previewMember, { unsubscribeUrl: "#unsubscribe", postalAddress: postalAddress ?? undefined });

    const setAudience = (next: Partial<Audience>) => setDraft((current) => ({ ...current, audience: { ...current.audience, ...next } }));

    const toggleStatus = (status: (typeof RING_STATUSES)[number]) =>
        setAudience({
            ringStatus: audience.ringStatus.includes(status)
                ? audience.ringStatus.filter((entry) => entry !== status)
                : [...audience.ringStatus, status],
        });

    const toggleYear = (year: number) =>
        setAudience({
            graduationYears: audience.graduationYears.includes(year)
                ? audience.graduationYears.filter((entry) => entry !== year)
                : [...audience.graduationYears, year],
        });

    const insertField = (name: MergeFieldName) => {
        const token = `{{${name}}}`;
        const element = body.current;
        if (!element) return;
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const next = draft.body.slice(0, start) + token + draft.body.slice(end);
        setDraft((current) => ({ ...current, body: next }));
        requestAnimationFrame(() => {
            element.focus();
            element.setSelectionRange(start + token.length, start + token.length);
        });
    };

    /** Saves if needed; the campaign's id afterwards, or null when saving failed. */
    const persist = async (): Promise<string | null> => {
        if (!dirty && draft.id) return draft.id;
        const result = await saveDraft(draft);
        if (result.error !== null) {
            setNotice({ kind: "error", text: result.error });
            return null;
        }
        const next = { ...draft, id: result.data.id };
        setDraft(next);
        setSaved(next);
        // Update the address without navigating: a navigation would remount the composer mid-send
        if (draft.id === null) window.history.replaceState(null, "", `/admin/email/${result.data.id}`);
        return result.data.id;
    };

    const onSave = () =>
        startTransition(async () => {
            setNotice(null);
            if (await persist()) setNotice({ kind: "ok", text: "Draft saved." });
        });

    const onTest = () =>
        startTransition(async () => {
            setNotice(null);
            const result = await sendTestEmail({ subject: draft.subject, body: draft.body });
            setNotice(result.error !== null ? { kind: "error", text: result.error } : { kind: "ok", text: `Test sent to ${result.data.to}.` });
        });

    const onDelete = () =>
        startTransition(async () => {
            if (!draft.id) return;
            const result = await deleteDraftAction({ id: draft.id });
            if (result.error !== null) {
                setNotice({ kind: "error", text: result.error });
                return;
            }
            router.push("/admin/email");
            router.refresh();
        });

    const onSend = () =>
        startTransition(async () => {
            setNotice(null);
            const id = await persist();
            if (!id) {
                setConfirming(false);
                return;
            }
            const started = await startSendingAction({ id });
            if (started.error !== null) {
                setConfirming(false);
                setNotice({ kind: "error", text: started.error });
                return;
            }
            await sending.run(id);
            // Done or paused, the report page shows where it stands and can resume
            router.push(`/admin/email/${id}`);
            router.refresh();
        });

    const busy = pending || sending.running;
    const progress = sending.counts ? progressOf(sending.counts) : null;

    return (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-8">
                <section aria-labelledby="audience-heading" className="space-y-5">
                    <h2 id="audience-heading" className="text-lg font-semibold">
                        Audience
                    </h2>

                    <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm font-medium">Ring status</legend>
                        <div className="flex flex-wrap gap-4">
                            {RING_STATUSES.map((status) => (
                                <label key={status} className="flex items-center gap-2 text-sm capitalize">
                                    <input
                                        type="checkbox"
                                        className="accent-primary size-4"
                                        checked={audience.ringStatus.includes(status)}
                                        onChange={() => toggleStatus(status)}
                                        disabled={busy}
                                    />
                                    {status}
                                </label>
                            ))}
                        </div>
                        <p className="text-muted-foreground text-xs">None ticked means every status.</p>
                    </fieldset>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="audience-site">Site</Label>
                            <Select value={audience.site} onValueChange={(value) => setAudience({ site: value as SiteFilter })} disabled={busy}>
                                <SelectTrigger id="audience-site" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(SITE_FILTERS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="audience-work">Co-op / internship</Label>
                            <Select
                                value={audience.openToWork === null ? "any" : audience.openToWork ? "yes" : "no"}
                                onValueChange={(value) => {
                                    const choice = value as OpenToWorkChoice;
                                    setAudience({ openToWork: choice === "any" ? null : choice === "yes" });
                                }}
                                disabled={busy}
                            >
                                <SelectTrigger id="audience-work" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(OPEN_TO_WORK).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {years.length > 0 && (
                        <fieldset className="space-y-2">
                            <legend className="mb-2 text-sm font-medium">Class of</legend>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {years.map((year) => (
                                    <label key={year} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className="accent-primary size-4"
                                            checked={audience.graduationYears.includes(year)}
                                            onChange={() => toggleYear(year)}
                                            disabled={busy}
                                        />
                                        {year}
                                    </label>
                                ))}
                            </div>
                            <p className="text-muted-foreground text-xs">None ticked means any year, including members who didn&apos;t say.</p>
                        </fieldset>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="audience-ids">Only these members (ring ids)</Label>
                        <Input
                            id="audience-ids"
                            inputMode="numeric"
                            placeholder="e.g. 3, 12, 40"
                            value={ringIdsText}
                            onChange={(event) => {
                                setRingIdsText(event.target.value);
                                setAudience({ ringIds: parseRingIds(event.target.value) });
                            }}
                            disabled={busy}
                        />
                        <p className="text-muted-foreground text-xs">Leave empty to use the filters above on everyone.</p>
                    </div>

                    <div className="border-border rounded-xl border p-4" aria-live="polite">
                        <p className="font-medium">
                            {recipients.length === 0
                                ? "Nobody matches yet."
                                : `Goes to ${recipients.length} member${recipients.length === 1 ? "" : "s"}.`}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">{describeAudience(audience)}</p>
                        {leftOut > 0 && (
                            <p className="text-muted-foreground mt-1 text-sm">
                                {leftOut} more match{leftOut === 1 ? "es" : ""} but unsubscribed or {leftOut === 1 ? "has" : "have"} no
                                usable email, so they&apos;re left out.
                            </p>
                        )}
                        {recipients.length > 0 && (
                            <details className="mt-3 text-sm">
                                <summary className="cursor-pointer select-none">Who&apos;s on the list</summary>
                                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                                    {recipients.map((member) => (
                                        <li key={member.ringId}>
                                            {member.recipient.name || "Unnamed member"}
                                            <span className="text-muted-foreground ml-2">#{member.ringId}</span>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </div>
                </section>

                <section aria-labelledby="message-heading" className="space-y-5">
                    <h2 id="message-heading" className="text-lg font-semibold">
                        Message
                    </h2>
                    <div className="space-y-2">
                        <Label htmlFor="email-subject">Subject</Label>
                        <Input
                            id="email-subject"
                            value={draft.subject}
                            maxLength={MAX_SUBJECT_LENGTH}
                            onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
                            disabled={busy}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email-body">Email</Label>
                        <Textarea
                            id="email-body"
                            ref={body}
                            rows={14}
                            maxLength={MAX_BODY_LENGTH}
                            remaining={MAX_BODY_LENGTH - draft.body.length}
                            value={draft.body}
                            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
                            disabled={busy}
                            aria-describedby="email-body-help"
                            className="font-mono text-sm"
                        />
                        <p id="email-body-help" className="text-muted-foreground text-xs">
                            Blank lines start a new paragraph. Lines starting with “- ” make a list. **bold**, [text](https://link) and
                            plain links work. Everything else shows as written.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Insert a merge field</p>
                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(MERGE_FIELDS) as MergeFieldName[]).map((name) => (
                                <Button
                                    key={name}
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => insertField(name)}
                                    disabled={busy}
                                    title={MERGE_FIELDS[name].description}
                                >
                                    {`{{${name}}}`}
                                </Button>
                            ))}
                        </div>
                        {unknown.length > 0 && (
                            <p role="alert" className="text-destructive text-sm">
                                Unknown merge field{unknown.length === 1 ? "" : "s"}: {unknown.map((name) => `{{${name}}}`).join(", ")}
                            </p>
                        )}
                    </div>
                </section>

                <div className="space-y-3">
                    {sendingProblem && (
                        <p role="status" className="border-border rounded-xl border border-dashed p-3 text-sm">
                            {sendingProblem} You can still write and save drafts.
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={onSave} disabled={busy || !dirty || !complete}>
                            {pending && !confirming ? "Working…" : "Save draft"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={onTest} disabled={busy || !complete || sendingProblem !== null}>
                            Send me a test
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setConfirming(true)}
                            disabled={busy || !complete || recipients.length === 0 || sendingProblem !== null}
                        >
                            Send to {recipients.length} member{recipients.length === 1 ? "" : "s"}…
                        </Button>
                        {draft.id && (
                            <Button type="button" variant="ghost" onClick={onDelete} disabled={busy} className="ml-auto">
                                Delete draft
                            </Button>
                        )}
                    </div>
                    {notice && (
                        <p role={notice.kind === "error" ? "alert" : "status"} className={notice.kind === "error" ? "text-destructive text-sm" : "text-sm"}>
                            {notice.text}
                        </p>
                    )}
                </div>
            </div>

            <section aria-labelledby="preview-heading" className="min-w-0 space-y-3 lg:sticky lg:top-6 lg:self-start">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 id="preview-heading" className="text-lg font-semibold">
                        Preview
                    </h2>
                    <div className="w-full space-y-1 sm:w-64">
                        <Label htmlFor="preview-as" className="text-xs">
                            As it reaches
                        </Label>
                        <Select value={previewRingId === null ? "self" : String(previewRingId)} onValueChange={(value) => setPreviewRingId(value === "self" ? null : Number(value))}>
                            <SelectTrigger id="preview-as" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="self">You ({self.name || "your profile"})</SelectItem>
                                {recipients.slice(0, 100).map((member) => (
                                    <SelectItem key={member.ringId} value={String(member.ringId)}>
                                        {member.recipient.name || "Unnamed member"} #{member.ringId}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <p className="text-sm">
                    <span className="text-muted-foreground">Subject: </span>
                    {preview.subject || <span className="text-muted-foreground">(no subject)</span>}
                </p>
                {/* sandbox with no permissions: the preview can't run scripts or navigate this page */}
                <iframe
                    title="Email preview"
                    sandbox=""
                    srcDoc={preview.html}
                    className="border-border h-[640px] w-full rounded-xl border bg-white"
                />
            </section>

            <Dialog open={confirming} onOpenChange={(open) => !busy && setConfirming(open)}>
                <DialogContent showCloseButton={!busy}>
                    <DialogHeader>
                        <DialogTitle>{sending.running || progress ? "Sending…" : `Send to ${recipients.length} members?`}</DialogTitle>
                        <DialogDescription>
                            “{draft.subject.trim()}” to {describeAudience(audience).toLowerCase()}. Sent emails can&apos;t be unsent.
                        </DialogDescription>
                    </DialogHeader>
                    {progress && (
                        <div className="space-y-2" aria-live="polite">
                            <progress className="accent-primary h-2 w-full" value={progress.finished} max={Math.max(progress.total, 1)} />
                            <p className="text-sm">
                                {progress.finished} of {progress.total} done
                                {sending.counts && sending.counts.failed + sending.counts.rejected > 0
                                    ? `, ${sending.counts.failed + sending.counts.rejected} didn't go out`
                                    : ""}
                                .
                            </p>
                        </div>
                    )}
                    {sending.error && (
                        <p role="alert" className="text-destructive text-sm">
                            {sending.error}
                        </p>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setConfirming(false)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={onSend} disabled={busy}>
                            {busy ? "Sending…" : `Send to ${recipients.length}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
