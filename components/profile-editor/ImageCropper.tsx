"use client";

import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PercentCrop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ASPECT_RATIO = 1;

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
// Start with a centred square covering most of the shorter side
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

export function ImageCropper({
    crop,
    setCropAction,
    setCompletedCropAction,
    imageSrc,
    imageRef,
}: {
    crop: Crop | undefined;
    setCropAction: React.Dispatch<React.SetStateAction<Crop | undefined>>;
    setCompletedCropAction: React.Dispatch<React.SetStateAction<PixelCrop | undefined>>;
    imageSrc: string;
    imageRef: React.Ref<HTMLImageElement>;
}): React.JSX.Element {
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCropAction(centerAspectCrop(width, height, ASPECT_RATIO));
    }

    return (
        <ReactCrop
            crop={crop}
            onChange={(_, percentageCrop) => setCropAction(percentageCrop)}
            onComplete={(c) => setCompletedCropAction(c)}
            aspect={ASPECT_RATIO}
            minHeight={100}
            circularCrop
            className="self-center"
        >
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL being cropped */}
            <img ref={imageRef} src={imageSrc} alt="Crop avatar" onLoad={onImageLoad} />
        </ReactCrop>
    );
}
