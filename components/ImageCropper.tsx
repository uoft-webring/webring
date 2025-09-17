"use client";

import ReactCrop, { Crop, PercentCrop, centerCrop, makeAspectCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css"; // IMPORTANT: Needed for styling ReactCrop component

function createAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    minimumValue: number
): Pick<PercentCrop, "unit"> & Partial<Omit<PercentCrop, "unit">> {
    if (mediaWidth <= mediaHeight) {
        return { unit: "%", width: minimumValue };
    } else {
        return { unit: "%", height: minimumValue };
    }
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
    minimumValue: number = 70
) {
    const aspectCrop: Pick<PercentCrop, "unit"> & Partial<Omit<PercentCrop, "unit">> = createAspectCrop(
        mediaWidth,
        mediaHeight,
        minimumValue
    );

    return centerCrop(makeAspectCrop(aspectCrop, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight);
}

export default function ImageCropper({
    crop,
    setCrop,
    setCompletedCrop,
    imageSrc,
    imageRef,
}: {
    crop: Crop | undefined;
    setCrop: React.Dispatch<React.SetStateAction<Crop | undefined>>;
    setCompletedCrop: React.Dispatch<React.SetStateAction<PixelCrop | undefined>>;
    imageSrc: string;
    imageRef: React.Ref<HTMLImageElement>;
}) {
    const ASPECT_RATIO = 1;

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        console.log("image width, height:", width, height);
        setCrop(centerAspectCrop(width, height, ASPECT_RATIO));
    }

    return (
        <ReactCrop
            crop={crop}
            onChange={(crop, percentageCrop) => {
                setCrop(percentageCrop);
            }}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={ASPECT_RATIO}
            minHeight={100}
            circularCrop
        >
            <img ref={imageRef} src={imageSrc} alt="Crop avatar" onLoad={onImageLoad} />
        </ReactCrop>
    );
}
