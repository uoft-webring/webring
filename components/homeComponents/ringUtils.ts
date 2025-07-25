export const ROTATION_SPEED = 0.03;

export const PLANE_NOISE_AMPLITUDE = 6;
export const PLANE_SIZE = 1024;
export const PLANE_DENSITY = 0.25;

const getSphereSize = (total: number) => {
    // Used a regression model, y_1 ~ a x_1 ^ b
    return 100 * Math.pow(total, 100);
};

export const getSpherePosition = (currentIndex: number, total: number) => {
    // Used a regression model, y_1 ~ a x_1 ^ b
    // const scalingFactor = 6.86054 * Math.pow(total, 0.17297);
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
