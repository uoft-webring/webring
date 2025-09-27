"use client";
import { Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function ShareButton({ title, url }: { title: string; url: string }) {
    const handleShare = async () => {
        if (!url) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url,
                });
            } catch (err) {
                toast.error("We're sorry! Something went wrong. Please try again later.", {
                    duration: 1000,
                });
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Profile link copied to clipboard!", {
                    duration: 1000,
                });
            } catch (err) {
                toast.error("We're sorry! Something went wrong. Please try again later.", {
                    duration: 1000,
                });
            }
        }
    };

    return (
        <Button
            onClick={handleShare}
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 flex items-center rounded-full px-3 py-2.5 text-sm transition focus:ring-2 focus:outline-none"
        >
            <Share2 className="mr-2 h-4 w-4" />
            Share
        </Button>
    );
}
