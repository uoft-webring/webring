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

export const getXPosition = (total: number) => {
    return 1.05 * total + 2;
};
