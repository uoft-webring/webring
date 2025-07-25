import { useState, useEffect} from "react";
import { cn } from "@/lib/utils";

function FallbackImage({ className, ...props }: any) {
    const [imageError, setImageError] = useState(false);
    const fallbackSrc = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${props.ringId}&radius=50`

    useEffect(() => {
        setImageError(false);
    }, [props.src]);

    return (
        <img
            src={(imageError || !props.src) ? fallbackSrc : props.src}
            className={cn("object-cover", className)}
            onError={(e) => {
                console.log("Profile error! Switching to fallback");
                
                setImageError(true);
            }}
        />
    );
}

export default FallbackImage;
