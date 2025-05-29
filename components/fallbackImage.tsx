import { useState } from "react";
import fallBack from "@/icons/fallbackImage.svg";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

function FallbackImage({ className, ...props }: any) {
    const [imageError, setImageError] = useState(false);
    if (imageError) {
        return (
            <Image
                fill
                className={cn("absolute", className)}
                alt="Profile"
                src={fallBack}
                {...props}
            />
        );
    }
    return (
        <img
            src={props.src}
            className={cn("object-cover", className)}
            onError={(e) => {
                console.log("Profile error! Switching to fallback");

                if (!imageError) {
                    setImageError(true);
                }
            }}
            {...props}
        />
    );
}

export default FallbackImage;
