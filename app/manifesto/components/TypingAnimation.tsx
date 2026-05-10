"use client";

import { TypeAnimation } from "react-type-animation";

const LINES = [
    "We are re-writing the developer's story.",
    "We are the difference they can't ignore.",
    "We are the choice to stand out.",
];

export function TypingAnimation(): React.JSX.Element {
    return (
        <>
            {/* Screen readers and reduced-motion users get the lines without the endless retyping */}
            <p className="sr-only">{LINES.join(" ")}</p>
            <TypeAnimation
                sequence={LINES.flatMap((line) => [line, 1000])}
                wrapper="p"
                speed={50}
                aria-hidden
                className="motion-reduce:hidden"
                style={{ display: "inline-block" }}
                repeat={Infinity}
            />
            <p aria-hidden className="hidden motion-reduce:block">
                {LINES[LINES.length - 1]}
            </p>
        </>
    );
}
