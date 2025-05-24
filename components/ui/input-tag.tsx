"use client";

import React, { ReactNode, InputHTMLAttributes, useState } from "react";
import { X } from "lucide-react";
import SkillTag from "../skillTag";

// Utility function to combine classes (similar to `cn` in Vue)
const cn = (...classes: (string | undefined)[]) =>
    classes.filter(Boolean).join(" ");

// Types for props
interface TagsInputRootProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    error: string | undefined;
}

interface TagsInputInputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

interface TagsInputItemProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

interface TagsInputItemDeleteProps
    extends React.HTMLAttributes<HTMLOrSVGElement> {
    className?: string;
}

interface TagsInputItemTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    className?: string;
}

const TagsInput: React.FC<TagsInputRootProps> = ({
    children,
    className,
    error,
    ...props
}) => {
    return (
        <div
            {...props}
            className={cn(
                `flex flex-wrap gap-2 items-center rounded-md border ${
                    error ? "border-destructive" : "border-input"
                } bg-background px-3 py-1.5 text-sm`,
                className
            )}
        >
            {children}
        </div>
    );
};

const TagsInputInput: React.FC<TagsInputInputProps> = ({
    className,
    ...props
}) => {
    return (
        <input
            {...props}
            className={cn(
                "text-sm min-h-5 focus:outline-none flex-1 bg-transparent px-1 py-2",
                "placeholder:text-muted-foreground rounded-md px-3 py-2 text-base md:text-sm",
                className
            )}
        />
    );
};

const TagsInputItem: React.FC<TagsInputItemProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div
            {...props}
            className={cn(
                "flex h-5 items-center rounded-md bg-secondary data-[state=active]:ring-ring data-[state=active]:ring-2 data-[state=active]:ring-offset-2 ring-offset-background",
                className
            )}
        >
            {children}
        </div>
    );
};

const TagsInputItemDelete: React.FC<TagsInputItemDeleteProps> = ({
    className,
    // onClick,
    ...props
}) => {
    return (
        <button
            {...props}
            type="button"
            className={cn("flex rounded bg-transparent mr-1", className)}
        >
            <X className="w-4 h-4" /*  onClick={onClick} */ />
        </button>
    );
};

const TagsInputItemText: React.FC<TagsInputItemTextProps> = ({
    className,
    ...props
}) => {
    return (
        <span
            {...props}
            className={cn(
                "py-0.5 px-2 text-sm rounded bg-transparent",
                className
            )}
        />
    );
};

// Main component
function TagInputComponent({
    tags,
    onTagsChange,
    error,
    ...props
}: {
    tags: string[];
    onTagsChange: any;
    error: string | undefined;
} & React.ComponentProps<"div">) {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            e.preventDefault();
            const newTags = [...tags, inputValue.trim()];
            console.log(newTags);
            onTagsChange(newTags);
            setInputValue("");
        }
    };

    const handleTagDelete = (index: number) => {
        console.log("Deleting", tags[index]);
        const newTags = [...tags];
        newTags.splice(index, 1);
        onTagsChange(newTags);
    };

    console.log("Rendering TagInputComponent with tags:", tags);

    return (
        <div className="tag-input">
            <TagsInput
                className="my-custom-class py-3"
                error={error}
                {...props}
            >
                {tags.map((tag, index) => (
                    // <TagsInputItem key={index} className="tag-item-class">
                    //     <TagsInputItemText className="tag-text-class">
                    //         {tag}
                    //     </TagsInputItemText>
                    //     <TagsInputItemDelete
                    //         onClick={(e) => {
                    //             e.preventDefault();
                    //             console.log("Checking delete");
                    //             handleTagDelete(index);
                    //         }}
                    //     />
                    // </TagsInputItem>

                    <SkillTag
                        key={index}
                        tagName={tag}
                        index={index}
                        size="mini"
                        onClick={(e) => {
                            handleTagDelete(index);
                        }}
                    />
                ))}
                <TagsInputInput
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag"
                    className="tag-input-class"
                />
            </TagsInput>
            {error && <p className="text-destructive mb-2 mt-2">{error}</p>}
        </div>
    );
}

export default TagInputComponent;
