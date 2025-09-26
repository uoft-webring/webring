import { cva } from "class-variance-authority";
import React from "react";

import { X as Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const SkillTagColors = [
    "border-red-400/80 bg-red-400/40",
    "border-orange-400/80 bg-orange-400/40",
    "border-amber-400/80 bg-amber-400/40",
    "border-yellow-400/80 bg-yellow-400/40",
    "border-lime-400/80 bg-lime-400/40",
    "border-green-400/80 bg-green-400/40",
    "border-emerald-400/80 bg-emerald-400/40",
    "border-teal-400/80 bg-teal-400/40",
    "border-cyan-400/80 bg-cyan-400/40",
    "border-sky-400/80 bg-sky-400/40",
    "border-blue-400/80 bg-blue-400/40",
    "border-indigo-400/80 bg-indigo-400/40",
    "border-violet-400/80 bg-violet-400/40",
    "border-purple-400/80 bg-purple-400/40",
    "border-fuchsia-400/80 bg-fuchsia-400/40",
    "border-pink-400/80 bg-pink-400/40",
    "border-rose-400/80 bg-rose-400/40",
];

function mapSkillToColor(skill: string) {
    let hash = 0;
    for (let i = 0; i < skill.length; i++) {
        hash = (hash << 5) - hash + skill.charCodeAt(i);
        hash |= 0; // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % SkillTagColors.length;
    return SkillTagColors[index];
}

// Define CVA variants for the SkillTag component (size and fontWeight variants)
const skillTagVariants = cva(
    "rounded-full px-3", // Common styles (padding and border-radius)
    {
        variants: {
            size: {
                default: "border-1 py-1", // Default variant with border 2px and padding 1
                mini: "border-1 py-0.5", // Mini variant with border 1px and padding 0.5
            },
            fontWeight: {
                default: "font-bold", // Default variant with bold font
                mini: "font-medium", // Mini variant with medium font
            },
        },
        defaultVariants: {
            size: "default", // Default to 'default' variant
            fontWeight: "default", // Default to 'font-bold'
        },
    }
);

// SkillTag component using the variants defined by CVA
interface SkillTagProps extends React.ComponentProps<"div"> {
    tagName: string;
    index?: number;
    size?: "default" | "mini"; // Variant for size (default or mini)
    deleteButton?: boolean;
}

const SkillTag: React.FC<SkillTagProps> = ({
    tagName,
    size = "default", // Default to "default" variant
    deleteButton = false,
    ...props
}) => {
    // Get the styles from the CVA helper for both size and fontWeight
    const tagContainerStyles = skillTagVariants({
        size,
        fontWeight: size === "mini" ? "mini" : "default",
    });

    // We pass the font weight class directly to the <p> tag since that's where the text is styled
    const tagTextStyles = size === "mini" ? "font-medium" : "font-bold";

    return (
        <div
            className={cn(
                { "flex items-center justify-center mx-1": deleteButton },
                tagContainerStyles,
                mapSkillToColor(tagName)
            )} // Apply variant styles and dynamic color
            {...props}
        >
            <p className={cn(tagTextStyles, "text-white select-none")}>
                {/* Apply font weight directly here */}
                {tagName}
            </p>
            {deleteButton && (
                <Delete
                    className="ml-2 text-white hover:text-red-500"
                    onClick={() => {
                        // Handle delete action here
                        console.log(`Delete tag: ${tagName}`);
                    }}
                />
            )}
        </div>
    );
};

export default SkillTag;
