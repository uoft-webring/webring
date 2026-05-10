"use client";

import { Share2 } from "lucide-react";
import posthog from "posthog-js";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function ShareButton({ title, url }: { title: string; url: string }): React.JSX.Element {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                posthog.capture("profile_shared", { method: "native_share", url });
            } catch (error) {
                // Closing the share sheet rejects with AbortError: not a failure
                if (error instanceof DOMException && error.name === "AbortError") return;
                toast.error("We're sorry! Something went wrong. Please try again later.", { duration: 1000 });
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            posthog.capture("profile_shared", { method: "clipboard", url });
            toast.success("Profile link copied to clipboard!", { duration: 1000 });
        } catch {
            toast.error("We're sorry! Something went wrong. Please try again later.", { duration: 1000 });
        }
    };

    return (
        <Button
            onClick={handleShare}
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 flex items-center rounded-full px-3 py-2.5 text-sm transition focus:ring-2 focus:outline-none"
        >
            <Share2 className="mr-2 h-4 w-4" aria-hidden />
            Share
        </Button>
    );
}
