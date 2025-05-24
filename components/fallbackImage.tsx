import { useState } from "react";
import fallBack from "@/icons/fallbackImage.svg";
import Image, { ImageProps } from "next/image";

function FallbackImage({ ...props }: any) {
    const [imageError, setImageError] = useState(false);
    if (imageError) {
        return (
            <Image
                fill
                className="absolute"
                alt="Profile"
                {...props}
                src={fallBack}
            />
        );
    }
    return (
        <img
            src={props.src}
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
