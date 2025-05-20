import React from "react";

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

export default function SkillTag({
    tagName,
    index,
    ...props
}: { tagName: string; index: number } & React.ComponentProps<"div">) {
    return (
        <div
            key={index}
            className={`border-2 px-3 py-1 rounded-full ${mapSkillToColor(
                tagName
            )}`}
        >
            <p className="font-bold text-white">{tagName}</p>
        </div>
    );
}
