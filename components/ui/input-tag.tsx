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
    ...props
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

        console.log(`removed: ${value}`);
        onTagsChange(tags.filter((tag) => tag !== value));
    };

    const handleSelect = (value: string) => {
        if (tags.includes(value)) {
            handleRemove(value);
            return;
        }

        console.log(`selected: ${value}`);
        onTagsChange([...tags, value]);
    };

    return (
        <>
            <Tags>
                <TagsTrigger>
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
                                <TagsItem
                                    key={tag}
                                    onSelect={handleSelect}
                                    value={tag}
                                >
                                    {tag}
                                    {tags.includes(tag) && (
                                        <CheckIcon
                                            className="text-muted-foreground"
                                            size={14}
                                        />
                                    )}
                                </TagsItem>
                            ))}
                        </TagsGroup>
                    </TagsList>
                </TagsContent>
            </Tags>
            {error && <p className="text-destructive mb-2 mt-2">{error}</p>}
        </>
    );
};

export default TagInputComponent;
