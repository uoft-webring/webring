"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/Addons.js";
import { useRef, useMemo, useState, useEffect } from "react";
import {
    EffectComposer,
    Bloom,
    ToneMapping,
} from "@react-three/postprocessing";
import {
    PLANE_DENSITY,
    PLANE_SIZE,
    ROTATION_SPEED,
    PLANE_NOISE_AMPLITUDE,
} from "./ringUtils";

export function ClientRing() {
    const planeRef = useRef<any>(undefined);
    const groupRef = useRef<any>(undefined);

    return (
        <Canvas
            // style={{ width: "100svw", height: "100svh" }}
            gl={{ antialias: true, alpha: true }}
        >
            <Main groupRef={groupRef} planeRef={planeRef} />
        </Canvas>
    );
}

function Main({ groupRef, planeRef }: any) {
    const simplex = useMemo(() => new SimplexNoise(), []);
    const lastTimeRef = useRef(null);
    const [value, setValue] = useState(0);
    const [currentHover, setCurrentHover] = useState<number | null>(null);

    const speed = ROTATION_SPEED;

    // Animate plane vertices (like moveNoise in original)
    useFrame(() => {
        let animationFrameId: any;

        const update = (timestamp: any) => {
            if (lastTimeRef.current !== null) {
                const delta = (timestamp - lastTimeRef.current) / 1000;
                setValue((prev) => prev - delta * speed);
            }
            lastTimeRef.current = timestamp;
            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);
    });

    useEffect(() => {
        if (planeRef.current) {
            const { geometry } = planeRef.current;
            const position = geometry.attributes.position;

            for (let i = 0; i < position.count; i++) {
                const x = position.getX(i);
                const y = position.getY(i);
                const z =
                    simplex.noise(x * 0.02, y * 0.02) * PLANE_NOISE_AMPLITUDE; // Adjust scale as needed
                position.setZ(i, z);
            }

            position.needsUpdate = true;
            geometry.computeVertexNormals();
        }
    }, []);

    return (
        <>
            <PerspectiveCamera
                makeDefault
                fov={60}
                position={[0, 0, 20]}
                // -2 * Math.PI * (80 / 360)
                // rotation={[0, 0, 2 * Math.PI * (60 / 360)]}
                zoom={1}
            />

            <group
                ref={groupRef}
                position={[0, -30, 0]}
                rotation={[-0.5 * Math.PI, 0, 0]}
            >
                <mesh ref={planeRef} position={[0, 0, 0]}>
                    <planeGeometry
                        args={[
                            PLANE_SIZE,
                            PLANE_SIZE,
                            PLANE_SIZE * PLANE_DENSITY,
                            PLANE_SIZE * PLANE_DENSITY,
                        ]}
                    />
                    <meshLambertMaterial
                        color={0x334466}
                        opacity={1}
                        side={THREE.FrontSide}
                        transparent={false}
                        // depthTest={false}
                        wireframe
                    />
                </mesh>
            </group>

            <ambientLight />

            {/* Group */}

            <EffectComposer>
                <Bloom
                    mipmapBlur
                    luminanceThreshold={5}
                    levels={2} /*levels={levels} intensity={intensity * 4} */
                />
                <ToneMapping />
            </EffectComposer>

            <group position={[0, -1, 0]} rotation={[0, value, 0]}>
                {[...Array(63).keys()]
                    .map((value) => {
                        return { arrayValue: value, secondary: Math.random() };
                    })
                    .map((data, index: number) => {
                        return (
                            <group
                                position={[
                                    14 * Math.cos(data.arrayValue / 10),
                                    // 0.5 * Math.sin(80 * value),
                                    0,
                                    14 * Math.sin(data.arrayValue / 10),
                                    // 0,
                                ]}
                                rotation={[
                                    (1 + (index % 5)) * value * 6,
                                    (1 + (index % 3)) * value * 3,
                                    (1 + (index % 2)) * value * 9,
                                ]}
                            >
                                <Sphere
                                    key={data.arrayValue}
                                    args={[1, 8, 8]}
                                    scale={0.35}
                                    // onPointerOver={() => {
                                    //   setCurrentHover(index);
                                    // }}
                                    // onPointerOut={() => {
                                    //   setCurrentHover(null);
                                    // }}
                                >
                                    <meshBasicMaterial
                                        color={"#fff"}
                                        wireframe={true}
                                    />
                                </Sphere>
                                {/* <Billboard>
                <Text
                  position={[0, 0.75 * (2 * (index % 2) - 1), 0]}
                  fontSize={0.2}
                >
                  randomdomain.com
                </Text>
              </Billboard> */}
                            </group>
                        );
                    })}
            </group>

            <OrbitControls
                makeDefault
                enablePan={false}
                rotateSpeed={0.3}
                onChange={(a) => {
                    if (a) {
                        console.log(a.target.object);
                    }
                }}
            />
        </>
    );
}
