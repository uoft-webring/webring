import Image from "next/image";
import TypingAnimation from "./components/TypingAnimation";

export default function Page() {
    return (
        <div className="mx-auto flex max-w-4xl flex-col px-4 py-8">
            <br />
            <p
                className="tag mb-[1.25ch] text-[1.125rem] font-medium tracking-[0.1em] uppercase opacity-60"
                style={{
                    letterSpacing: "0.1em",
                    opacity: 0.6,
                    fontWeight: 500,
                    marginBottom: "1.25ch",
                }}
            >
                manifesto
            </p>
            <h1 className="mt-2 mb-6 text-[2.75rem] font-bold md:text-[2.75rem] lg:text-[4.25rem]">
                Your resume is obsolete.
            </h1>
            <br />
            <p className="mb-4 text-[1rem] font-medium text-white md:text-[1.25rem] md:leading-[1.6] lg:text-[1.375rem]">
                Yes, <span className="font-bold">we said it.</span>
            </p>
            <p className="mb-2 text-[1rem] text-white md:text-[1.25rem] md:leading-[1.6] lg:text-[1.375rem]">
                That PDF{" "}
                <span
                    className="ghost text-gray-400 italic"
                    style={{ animation: "ghost-fade 5s ease-in-out infinite" }}
                >
                    ghost
                </span>
                . That templated list.
                <br />
                It made you invisible.
                <br />
                Another line item in a sea of sameness.
            </p>
            <div className="my-6">
                <Image
                    src="/resume.png"
                    width={600}
                    height={328}
                    alt="(Insert your boring resume)"
                    className="rounded-[0.75rem] shadow-md"
                    unoptimized
                />
            </div>
            <p className="mb-2 text-[1rem] text-white md:text-[1.25rem] md:leading-[1.6] lg:text-[1.375rem]">
                But your work isn&apos;t a line item.
                <br />
                It&apos;s a story.
                <br />
                Your portfolio is your{" "}
                <span
                    className="pulse-text"
                    style={{
                        animation: "pulse 0.8s ease-in-out infinite",
                        fontWeight: 600,
                        display: "inline-block",
                    }}
                >
                    pulse
                </span>
                .
            </p>
            <p className="mb-4 text-[1rem] font-bold md:text-[1.25rem] md:leading-[1.6] lg:text-[1.375rem]">
                This is a rebellion.
            </p>
            <h2 className="relative mb-4 pl-6 text-[1.5rem] font-semibold md:text-[2.2rem] lg:text-[2.75rem]">
                <span
                    style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "0.3125rem",
                        height: "2ch",
                        backgroundColor: "var(--foreground)",
                        borderRadius: "0.125rem",
                        marginBottom: "-0.25rem",
                        marginRight: "0.5ch",
                        content: "",
                    }}
                ></span>
                We are UofT Webring.
            </h2>
            <br />
            <div className="mb-6 w-full">
                <TypingAnimation />
            </div>
            <p className="mb-2 text-[1rem] text-white md:text-[1.25rem] md:leading-[1.6] lg:text-[1.375rem]">
                We're not here to showcase your work.
                <br />
                We're here to unleash your identity.
            </p>
            <p className="mb-2 text-[1rem] text-white md:text-[1.25rem] md:leading-[1.6] lg:text-[1.375rem]">
                The future doesn't belong to the cookie-cutter developer.
                <br />
                It belongs to the one who can't be copied.
            </p>
            <p className="mb-2 text-[1rem] text-white md:text-[1.25rem] md:leading-[1.6] lg:text-[1.375rem]">
                So, show them who you are.
            </p>
            <p className="mb-2 text-[1rem] text-white md:text-[1.25rem] md:leading-[1.6] lg:text-[1.375rem]">
                Because when everyone is a brand,
            </p>
            <p className="mb-2 text-[1.5rem] font-bold md:text-[2.2rem]">being yourself is the revolution.</p>
            <style>{`
        @keyframes pulse {
          0% { color: #ffffff; }
          10% { color: #f88; }
          100% { color: #ffffff; }
        }
        @keyframes ghost-fade {
          0% { opacity: 0.25; }
          50% { opacity: 0.5; }
          100% { opacity: 0.25; }
        }
      `}</style>
        </div>
    );
}
