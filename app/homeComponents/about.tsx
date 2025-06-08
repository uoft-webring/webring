"use client";

// import Image from "next/image";
// import about from "@/icons/about.png";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface TextRevealProps {
    progress: MotionValue<number>;
}

interface LineRevealProps {
    line: string;
    start: number;
    end: number;
    progress: MotionValue<number>;
}

interface WordRevealProps {
    word: string;
    start: number;
    end: number;
    progress: MotionValue<number>;
}

// interface CharacterRevealProps {
//     character: string;
//     start: number;
//     end: number;
//     progress: MotionValue<number>;
// }

const about = [
    "What is UofT Webring?!?",
    "A place for you to show off your interests, hobbies and skills",
    "A community for UofT students and alumni built by UofT students",
    "Put yourself out there and make yourself visible",
];

export default function About() {
    const textContainer = useRef(null);
    const { scrollYProgress } = useScroll({
        target: textContainer,
        offset: ["start 0.9", "start 0.1"],
    });

    // useEffect(() => {
    //     scrollYProgress.on("change", (e) => console.log(e));
    // }, []);

    return (
        <div className="flex justify-center bg-blue-950 py-[5rem]">
            <div ref={textContainer}>
                <TextReveal progress={scrollYProgress} />
            </div>
        </div>
    );
}

const TextReveal = ({ progress }: TextRevealProps) => {
    return (
        <div className="w-full max-w-[35rem] md:max-w-[60rem]">
            {about.map((line, index) => {
                const start = index / about.length;
                const end = start + 1 / about.length;
                return (
                    <Line
                        key={index}
                        line={line}
                        start={start}
                        end={end}
                        progress={progress}
                    ></Line>
                );
            })}
        </div>
    );
};

const Line = ({ line, start, end, progress }: LineRevealProps) => {
    const lineLength = end - start;
    const words = line.split(" ");
    return (
        <span className="flex flex-wrap justify-center mb-5">
            {words.map((word, index) => {
                const w_start = start + lineLength * (index / words.length);
                const w_end = w_start + lineLength * (1 / words.length);
                return (
                    <Word
                        key={index}
                        word={word}
                        start={w_start}
                        end={w_end}
                        progress={progress}
                    ></Word>
                );
            })}
        </span>
    );
};

const Word = ({ word, start, end, progress }: WordRevealProps) => {
    // const wordLength = end - start;
    // console.log("word:", start, "end:", end);
    const transitionRange = [start, end];
    const opacity = useTransform(progress, transitionRange, [0, 1]);
    return (
        <span className="ml-2">
            {/* {word.split("").map((character, index) => {
                const c_start = start + wordLength * (index / word.length);
                const c_end = c_start + wordLength * (1 / word.length);
                return (
                    <Character
                        key={index}
                        character={character}
                        start={c_start}
                        end={c_end}
                        progress={progress}
                    ></Character>
                );
            })} */}
            <span className="relative text-3xl md:text-4xl font-extrabold">
                <span className="absolute opacity-8">{word}</span>
                <motion.span style={{ opacity: opacity }}>{word}</motion.span>
            </span>
        </span>
    );
};

// const Character = ({
//     character,
//     start,
//     end,
//     progress,
// }: CharacterRevealProps) => {
//     const transitionRange = [start, end];
//     const opacity = useTransform(progress, transitionRange, [0, 1]);
//     return (
//         <span className="relative text-2xl font-extrabold">
//             <span className="absolute opacity-8">{character}</span>
//             <motion.span
//                 style={{ opacity: opacity }}
//                 transition={{ duration: 2 }}
//             >
//                 {character}
//             </motion.span>
//         </span>
//     );
// };
