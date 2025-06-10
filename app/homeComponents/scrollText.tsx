import { useRef } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionTemplate,
} from "framer-motion";

/*
 * Read the blog post here:
 * https://letsbuildui.dev/series/scroll-animations-with-framer-motion/highlighting-text-on-scroll
 */
const ContentLine = ({ content }: { content: string }) => {
    const contentRef = useRef<HTMLSpanElement | null>(null);

    const { scrollYProgress } = useScroll({
        target: contentRef,
        offset: ["end end", "start start"],
    });

    const scrollValue = useTransform(
        scrollYProgress,
        [0.25, 0.75],
        ["100%", "0%"]
    );
    const clipPathVal = useMotionTemplate`inset(0% ${scrollValue} 0% 0%)`;

    return (
        <span
            className="relative overflow-hidden block text-shadow-white [&:not(:last-child)]:mb-8"
            ref={contentRef}
        >
            <motion.span
                style={{ clipPath: clipPathVal }}
                className="text-white w-full h-full absolute left-0 transition-all before:content-[attr(data-text)] before:inline-block before:opacity-80"
                data-text={content}
            />
            <span className="static-text">{content}</span>
        </span>
    );
};

export const ScrollText = ({ content }: { content: string[] }) => {
    return (
        <div className="px-8 py-16">
            <div className="[&_h2]:inline">
                <h2 className="text-white/20 text-center">
                    {content.map((item) => (
                        <ContentLine key={item} content={item} />
                    ))}
                </h2>
            </div>
        </div>
    );
};
