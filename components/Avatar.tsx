import Image from "next/image";
import FallbackImage from "./FallbackImage";
import verifiedIcon from "@/icons/verified.svg";
import { cn } from "@/lib/utils";
import { SafeUserType } from "@/utils/zod";
type AvatarProps = {
    user: SafeUserType;
    className?: string;
    verifiedSize?: string;
    width?: number;
    height?: number;
};

export default function Avatar({ user, className, verifiedSize = "size-9", width, height }: AvatarProps) {
    return (
        <div className="relative">
            <FallbackImage
                key={user.image_url + user.ring_id}
                src={user.image_url}
                seed={user.ring_id}
                alt={`${user.name}'s profile picture`}
                className={cn(
                    "rounded-full w-20",
                    user.is_verified && "border-4 border-card outline outline-white",
                    className
                )}
                width={width}
                height={height}
            />
            {user.is_verified && (
                <Image
                    src={verifiedIcon}
                    alt={`${user.name}'s verification badge`}
                    aria-hidden
                    priority={false}
                    fetchPriority="low"
                    className={cn("absolute right-0 bottom-0", verifiedSize)}
                />
            )}
        </div>
    );
}
