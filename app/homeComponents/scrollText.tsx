"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

/*
 * Read the blog post here:
 * https://letsbuildui.dev/series/scroll-animations-with-framer-motion/highlighting-text-on-scroll
 */

export const ScrollText = ({ content }: { content: string[] }) => {
    const contentRef = useRef<HTMLHeadingElement | null>(null);

    const { scrollYProgress } = useScroll({
        target: contentRef,
        offset: ["start 0.9", "start 0.1"],
    });

    return (
        <div className="px-8 py-16">
            <div className="[&_h2]:inline">
                <h2 ref={contentRef} className=" text-white/80">
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
    const lineLength = end - start;
    return (
        <span className="flex flex-wrap justify-center font-light not-last:mb-10">
            {words.map((word, index) => {
                const w_start = start + lineLength * (index / words.length);
                const w_end = w_start + lineLength * (1 / words.length);
                return (
                    <ContentWord
                        key={index}
                        word={word}
                        start={w_start}
                        end={w_end}
                        progress={progress}
                    />
                );
            })}
        </span>
    );
};

const ContentWord = ({
    word,
    start,
    end,
    progress,
}: {
    word: string;
    start: number;
    end: number;
    progress: MotionValue<number>;
}) => {
    const opacity = useTransform(progress, [start, end], ["10%", "100%"]);
    // const clipPathVal = useMotionTemplate`inset(0% ${scrollValue} 0% 0%)`;
    return (
        <span className="ml-2">
            {/* <span className="absolute opacity-10">{word}</span> */}
            <motion.span style={{ opacity: opacity }}>{word}</motion.span>
        </span>
    );
};
