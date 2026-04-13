"use client";

import { useRef, useCallback } from "react";
import { useScroll, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";

export const ScrollText = ({ content }: { content: string[] }) => {
    const contentRef = useRef<HTMLHeadingElement | null>(null);

    const { scrollYProgress } = useScroll({
        target: contentRef,
        offset: ["start 0.9", "start 0.1"],
    });

    return (
        <div className="px-8 py-16">
            <div className="[&_h2]:inline">
                <h2 ref={contentRef} className="text-white/80">
                    {content.map((item, index) => {
                        const start = index / content.length;
                        const end = start + 1 / content.length;
                        return (
                            <ContentLine
                                key={item}
                                content={item}
                                progress={scrollYProgress}
                                start={start}
                                end={end}
                            />
                        );
                    })}
                </h2>
            </div>
        </div>
    );
};

const ContentLine = ({
    content,
    progress,
    start,
    end,
}: {
    content: string;
    progress: MotionValue<number>;
    start: number;
    end: number;
}) => {
    const words = content.split(" ");
    const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
    const lineProgress = useTransform(progress, [start, end], [0, 1]);

    useMotionValueEvent(lineProgress, "change", (latest) => {
        const count = words.length;
        for (let i = 0; i < count; i++) {
            const el = wordsRef.current[i];
            if (!el) continue;
            const wordStart = i / count;
            const wordEnd = (i + 1) / count;
            const t = (latest - wordStart) / (wordEnd - wordStart);
            el.style.opacity = String(0.1 + 0.9 * Math.min(1, Math.max(0, t)));
        }
    });

    const setRef = useCallback(
        (i: number) => (el: HTMLSpanElement | null) => {
            wordsRef.current[i] = el;
        },
        []
    );

    return (
        <span className="flex flex-wrap justify-center font-light not-last:mb-10">
            {words.map((word, i) => (
                <span key={i} ref={setRef(i)} className="ml-2" style={{ opacity: 0.1 }}>
                    {word}
                </span>
            ))}
        </span>
    );
};
