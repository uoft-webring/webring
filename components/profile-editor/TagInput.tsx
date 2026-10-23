"use client";

import { CheckIcon } from "lucide-react";
import {
    Tags,
    TagsContent,
    TagsEmpty,
    TagsGroup,
    TagsInput,
    TagsItem,
    TagsList,
    TagsTrigger,
} from "@/components/ui/kibo-ui/tags";
import { TAGS } from "@/lib/data/tags";
import { SkillTag } from "@/components/SkillTag";

export function TagInput({
    tags,
    onTagsChange,
    error,
}: {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    error?: string;
}): React.JSX.Element {
    const remove = (tag: string) => onTagsChange(tags.filter((existing) => existing !== tag));
    const toggle = (tag: string) => (tags.includes(tag) ? remove(tag) : onTagsChange([...tags, tag]));

    return (
        <>
            <Tags>
                <TagsTrigger type="button" className="rounded-md">
                    {tags.map((tag) => (
                        <SkillTag key={tag} tagName={tag} size="mini" removable
                            onClick={(event) => {
                                // Removing a tag shouldn't also open the picker
                                event.stopPropagation();
                                remove(tag);
                            }}
                        />
                    ))}
                </TagsTrigger>
                <TagsContent>
                    <TagsInput placeholder="Search tag..." />
                    <TagsList>
                        <TagsEmpty />
                        <TagsGroup>
                            {TAGS.map((tag) => (
                                <TagsItem key={tag} onSelect={toggle} value={tag}>
                                    {tag}
                                    {tags.includes(tag) && <CheckIcon className="text-muted-foreground" size={14} />}
                                </TagsItem>
                            ))}
                        </TagsGroup>
                    </TagsList>
                </TagsContent>
            </Tags>
            {error && (
                <p role="alert" className="text-destructive mt-2 mb-2">
                    {error}
                </p>
            )}
        </>
    );
}
