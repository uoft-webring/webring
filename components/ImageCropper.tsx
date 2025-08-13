"use client";

import ReactCrop, { Pick, Crop, centerCrop, makeAspectCrop, PixelCrop } from "react-image-crop";
import { useState } from "react";
import "react-image-crop/dist/ReactCrop.css";

function createAspectCrop(mediaWidth: number, mediaHeight: number, minimumValue: number): Pick {
    if (mediaWidth <= mediaHeight) {
        return { unit: "%", width: minimumValue };
    } else {
        return { unit: "%", height: minimumValue };
    }
}
// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
    minimumValue: number = 70
) {
    const aspectCrop: Pick = createAspectCrop(mediaWidth, mediaHeight, minimumValue);

    return centerCrop(makeAspectCrop(aspectCrop, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight);
}

export default function ImageCropper({
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    imageSrc,
    imageRef,
    maxHeight,
}) {
    const ASPECT_RATIO = 1;

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        console.log(width, height);
        setCrop(centerAspectCrop(width, height, ASPECT_RATIO));
    }

    return (
        <ReactCrop
            crop={crop}
            onChange={(crop, percentageCrop) => {
                setCrop(percentageCrop);
            }}
            onComplete={(c, percentageCrop) => setCompletedCrop(c)}
            aspect={ASPECT_RATIO}
            // maxHeight={maxHeight}
            minHeight={100}
            circularCrop
        >
            <img ref={imageRef} src={imageSrc} alt="Crop avatar" onLoad={onImageLoad} />
        </ReactCrop>
    );
}
