export const ROTATION_SPEED = 0.03;

export const PLANE_NOISE_AMPLITUDE = 6;
export const PLANE_SIZE = 1024;
export const PLANE_DENSITY = 0.25;

export const getSpherePosition = (currentIndex: number, total: number) => {
    // Radius grows with membership so spheres don't overlap
    const scalingFactor = total;
    const result: [x: number, y: number, z: number] = [
        scalingFactor * Math.cos((2 * Math.PI * currentIndex) / total),
        0,
        scalingFactor * Math.sin((2 * Math.PI * currentIndex) / total),
    ];

    return result;
};

// Phones get a taller scene: the desktop formula leaves a ~270px strip on an 844px-tall screen
export const SCENE_HEIGHT_CLASS = "h-[max(20rem,55svh)] md:h-[max(12rem,calc(100svh-36rem))]";

/** How far to pull the camera back so more of the ring fits a portrait (narrow) canvas. */
export const cameraDistanceScale = (aspect: number): number => Math.min(1.4, Math.max(1, 1.3 / aspect));

// As the camera pulls back it rises and aims lower, so a tall canvas shows terrain instead of empty sky
export const CAMERA_LIFT = 12;
export const CAMERA_DIP = 20;

export const getXPosition = (total: number) => {
    return 1.05 * total + 2;
};
