"use client";

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
import { CheckIcon } from "lucide-react";
import { TAGS } from "@/utils/tags";
import SkillTag from "../SkillTag";

const TagInputComponent = ({
    tags,
    onTagsChange,
    error,
}: {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    error: string | undefined;
} & React.ComponentProps<"div">) => {
    // TODO fix the logic and var names
    const handleRemove = (value: string) => {
        if (!tags.includes(value)) {
            return;
        }

        onTagsChange(tags.filter((tag) => tag !== value));
    };

    const handleSelect = (value: string) => {
        if (tags.includes(value)) {
            handleRemove(value);
            return;
        }
        onTagsChange([...tags, value]);
    };

    return (
        <>
            <Tags>
                <TagsTrigger className="rounded-xl">
                    {tags.map((tag) => (
                        <SkillTag
                            key={tag} // Unique by assumption
                            tagName={tag}
                            size="mini"
                            onClick={() => handleRemove(tag)}
                            deleteButton
                        />
                    ))}
                </TagsTrigger>
                <TagsContent>
                    <TagsInput placeholder="Search tag..." />
                    <TagsList>
                        <TagsEmpty />
                        <TagsGroup>
                            {TAGS.map((tag) => (
                                <TagsItem key={tag} onSelect={handleSelect} value={tag}>
                                    {tag}
                                    {tags.includes(tag) && (
                                        <CheckIcon className="text-muted-foreground" size={14} />
                                    )}
                                </TagsItem>
                            ))}
                        </TagsGroup>
                    </TagsList>
                </TagsContent>
            </Tags>
            {error && <p className="text-destructive mt-2 mb-2">{error}</p>}
        </>
    );
};

export default TagInputComponent;
