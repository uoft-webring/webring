"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls, Sphere, Billboard, Text } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/Addons.js";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import {
    PLANE_DENSITY,
    PLANE_SIZE,
    ROTATION_SPEED,
    PLANE_NOISE_AMPLITUDE,
    getSpherePosition,
    getXPosition,
} from "./ringUtils";
import { SafeUserType } from "@/utils/zod";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function WebRing({ data }: { data: SafeUserType[] }) {
    const [fullSize, setFullSize] = useState<boolean>(false);
    const toggleSize = () => {
        setFullSize((fullSize) => !fullSize);
    };

    if (!data) return <div></div>;
    return (
        <div
            className={cn(
                "relative mb-8 flex w-full max-w-svw flex-col items-center justify-center transition-all",
                { "h-[calc(100svh-6rem)]": fullSize },
                { "h-[calc(100svh-36rem)]": !fullSize }
            )}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
        >
            <Canvas gl={{ antialias: true, alpha: true }} className="h-full w-full">
                <Scene data={data} />
            </Canvas>
            <div className="mt-2 flex max-h-fit w-full flex-col items-center justify-center">
                <Button
                    className="rounded-xl px-8 py-2 sm:px-6"
                    size="icon"
                    variant="outline"
                    onClick={toggleSize}
                >
                    {fullSize ? <ChevronUp className="size-8" /> : <ChevronDown className="size-8" />}
                </Button>
            </div>
        </div>
    );
}

function Scene({ data }: { data: SafeUserType[] }) {
    const planeRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const simplex = useMemo(() => new SimplexNoise(), []);
    const [rotation, setRotation] = useState(0);

    // Animate plane wave and rotation
    useFrame((_, delta) => {
        setRotation((prev) => prev - delta * ROTATION_SPEED);
    });

    // Apply noise to plane vertices on mount
    useEffect(() => {
        const mesh = planeRef.current;
        if (!mesh) return;

        const posAttr = mesh.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const z = simplex.noise(x * 0.02, y * 0.02) * PLANE_NOISE_AMPLITUDE;
            posAttr.setZ(i, z);
        }
        posAttr.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
    }, [simplex]);

    return (
        <>
            <PerspectiveCamera makeDefault fov={40} position={[getXPosition(data.length), 0, 20]} />
            <ambientLight />
            <OrbitControls makeDefault enablePan={false} rotateSpeed={0.3} />

            <group ref={groupRef} position={[0, -30, 0]} rotation={[-0.5 * Math.PI, 0, 0]}>
                <mesh ref={planeRef}>
                    <planeGeometry
                        args={[
                            PLANE_SIZE,
                            PLANE_SIZE,
                            PLANE_SIZE * PLANE_DENSITY,
                            PLANE_SIZE * PLANE_DENSITY,
                        ]}
                    />
                    <meshLambertMaterial color={0x334466} wireframe side={THREE.FrontSide} />
                </mesh>
            </group>

            <EffectComposer>
                <Bloom mipmapBlur luminanceThreshold={5} levels={2} />
                <ToneMapping />
            </EffectComposer>

            <group position={[0, -2, 0]} rotation={[0, rotation, 0]}>
                {data.map((user, index) => {
                    const pos = getSpherePosition(index, data.length);
                    const rot: [x: number, y: number, z: number] = [
                        (1 + (index % 5)) * rotation * 6,
                        (1 + (index % 3)) * rotation * 3,
                        (1 + (index % 2)) * rotation * 9,
                    ];
                    return (
                        <group key={index} position={pos} rotation={rot}>
                            <Sphere
                                args={[1, 8, 8]}
                                scale={1}
                                onPointerOver={() => (document.body.style.cursor = "pointer")}
                                onPointerOut={() => (document.body.style.cursor = "default")}
                                onClick={() => window.open(user.domain, "_blank")}
                            >
                                <meshBasicMaterial color="#fff" wireframe />
                            </Sphere>
                            <Suspense fallback={<></>}>
                                <Billboard>
                                    <Text fontSize={0.4} position={[0, -1.2, 0]}>
                                        {user.domain}
                                    </Text>
                                </Billboard>
                            </Suspense>
                        </group>
                    );
                })}
            </group>
        </>
    );
}
