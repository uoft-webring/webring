import TypingAnimation from "./components/TypingAnimation";
import resume from "@/public/resume.png";

export default function Page() {
    return (
        <section className="mx-auto mt-8 w-full max-w-[45rem] px-4 [&>p]:text-base md:[&>p]:text-xl">
            <p className="mb-[1.25ch] text-base font-medium tracking-[.1em] uppercase opacity-60">
                manifesto
            </p>
            <h1 className="lg:text-[4.25rem]">Your resume is obsolete.</h1>
            <br />
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Yes, <span className="font-black">we said it.</span>
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                That PDF <span className="ghost">ghost</span>. That templated list. It made you invisible.
                Another line item in a sea of sameness.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                <img src={resume.src} alt="(Insert your boring resume)" className="rounded-2xl" />
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                But your work isn't a line item. It's a story. Your portfolio is your{" "}
                <span className="pulse-text">pulse</span>.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">This is a rebellion.</p>
            <br />
            <h2 className="relative text-2xl before:mr-[0.5ch] before:mb-[-0.25rem] before:inline-block before:h-[2ch] before:w-[0.3125rem] before:rounded before:bg-[var(--foreground)] before:content-[''] lg:text-[2.75rem]">
                We are UofT Webring.
            </h2>
            <br />
            <TypingAnimation />
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We’re not here to showcase your work. We’re here to unleash your identity.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                The future doesn’t belong to the cookie-cutter developer. It belongs to the one who can’t be
                copied.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">So, show them who you are.</p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">Because when everyone is a brand,</p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                <span className="font-bold text-white">being yourself is the revolution.</span>
            </p>
        </section>
    );
}
