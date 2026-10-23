import ReactMarkdown, { type Components } from "react-markdown";
import { cn } from "@/lib/cn";

// Members write this, so keep it to text formatting: no raw HTML (react-markdown never renders
// it), no images, and headings demoted so they sit under the page's own section headings
const ALLOWED = ["p", "strong", "em", "a", "ul", "ol", "li", "blockquote", "code", "pre", "h3", "h4", "hr", "br"];

const components: Components = {
    h1: ({ children }) => <h3>{children}</h3>,
    h2: ({ children }) => <h3>{children}</h3>,
    h5: ({ children }) => <h4>{children}</h4>,
    h6: ({ children }) => <h4>{children}</h4>,
    a: ({ href, children }) => (
        <a href={href} target="_blank" rel="nofollow ugc noopener noreferrer">
            {children}
        </a>
    ),
};

// Text styles for rendered Markdown (the Tailwind typography plugin isn't installed)
const PROSE = [
    "max-w-[68ch] leading-relaxed text-pretty break-words",
    "[&_p]:mb-4 [&_p:last-child]:mb-0",
    "[&_a]:text-foreground [&_a]:underline [&_a]:decoration-(--profile-accent) [&_a]:decoration-2 [&_a]:underline-offset-4",
    "[&_strong]:text-foreground [&_strong]:font-semibold",
    "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1",
    "[&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold",
    "[&_h4]:text-foreground [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-semibold",
    "[&_blockquote]:border-(--profile-accent) [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic",
    "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm",
    "[&_pre]:bg-muted [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
    "[&_hr]:border-border [&_hr]:my-6",
].join(" ");

/** Member-written Markdown, rendered safely. react-markdown already drops javascript: and data: URLs. */
export function Markdown({ children, className }: { children: string; className?: string }): React.JSX.Element {
    return (
        <div className={cn(PROSE, className)}>
            <ReactMarkdown
                allowedElements={[...ALLOWED, "h1", "h2", "h5", "h6"]}
                unwrapDisallowed
                components={components}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
