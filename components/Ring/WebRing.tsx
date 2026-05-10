"use client";

import { Billboard, OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
// Import the module directly: the examples/jsm/Addons.js barrel pulls in every three.js addon
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { cn } from "@/lib/cn";
import type { PublicProfile } from "@/lib/profiles/types";
import { displayDomain } from "@/lib/site";
import { Button } from "../ui/button";
import {
    getSpherePosition,
    getXPosition,
    PLANE_DENSITY,
    PLANE_NOISE_AMPLITUDE,
    PLANE_SIZE,
    ROTATION_SPEED,
} from "./ringUtils";

// One geometry and material shared by every sphere instead of one pair per member
const sphereGeometry = new THREE.SphereGeometry(1, 8, 8);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: "#fff", wireframe: true });

function sphereSpin(index: number): THREE.Vector3 {
    return new THREE.Vector3(
        (1 + (index % 5)) * ROTATION_SPEED * 6,
        (1 + (index % 3)) * ROTATION_SPEED * 3,
        (1 + (index % 2)) * ROTATION_SPEED * 9
    );
}

// Members' domains are validated as http(s) on write, but never hand window.open anything else
function openMemberSite(domain: string) {
    try {
        if (["http:", "https:"].includes(new URL(domain).protocol)) {
            window.open(domain, "_blank", "noopener,noreferrer");
        }
    } catch {
        // malformed legacy value: ignore the click
    }
}

function MemberSphere({ member, position }: { member: PublicProfile; position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh
                geometry={sphereGeometry}
                material={sphereMaterial}
                onPointerOver={() => (document.body.style.cursor = "pointer")}
                onPointerOut={() => (document.body.style.cursor = "default")}
                onClick={() => openMemberSite(member.domain)}
            />
            <Suspense fallback={null}>
                <Billboard>
                    <Text fontSize={0.4} position={[0, -1.2, 0]}>
                        {displayDomain(member.domain)}
                    </Text>
                </Billboard>
            </Suspense>
        </group>
    );
}

function NoisyPlane() {
    const [geometry] = useState(() => {
        const segments = Math.round(PLANE_SIZE * PLANE_DENSITY);
        const plane = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, segments, segments);
        // Displace once up front; the terrain never changes afterwards
        const noise = new SimplexNoise();
        const position = plane.attributes.position;
        for (let i = 0; i < position.count; i++) {
            position.setZ(i, noise.noise(position.getX(i) * 0.02, position.getY(i) * 0.02) * PLANE_NOISE_AMPLITUDE);
        }
        return plane;
    });

    useEffect(() => () => geometry.dispose(), [geometry]);

    return (
        <group position={[0, -30, 0]} rotation={[-0.5 * Math.PI, 0, 0]}>
            <mesh geometry={geometry}>
                {/* Unlit wireframe: looks identical to the old lit version without needing a light */}
                <meshBasicMaterial color={0x334466} wireframe />
            </mesh>
        </group>
    );
}

function Scene({ members, still }: { members: PublicProfile[]; still: boolean }) {
    const ringRef = useRef<THREE.Group>(null);
    const spins = members.map((_, index) => sphereSpin(index));

    // One frame callback for the whole ring instead of one per member
    useFrame((_, delta) => {
        const ring = ringRef.current;
        if (!ring || still) return;
        ring.rotation.y -= delta * ROTATION_SPEED;
        ring.children.forEach((sphere, index) => {
            const spin = spins[index];
            if (!spin) return;
            sphere.rotation.x -= delta * spin.x;
            sphere.rotation.y -= delta * spin.y;
            sphere.rotation.z -= delta * spin.z;
        });
    });

    return (
        <>
            <PerspectiveCamera makeDefault fov={40} position={[getXPosition(members.length), 0, 20]} />
            <OrbitControls makeDefault enablePan={false} rotateSpeed={0.3} />
            <NoisyPlane />
            <group ref={ringRef} position={[0, -2, 0]}>
                {members.map((member, index) => (
                    <MemberSphere
                        key={member.ringId}
                        member={member}
                        position={getSpherePosition(index, members.length)}
                    />
                ))}
            </group>
        </>
    );
}

/** `still` (reduced motion) renders the same scene without the constant spin; dragging still works. */
export function WebRing({ members, still = false }: { members: PublicProfile[]; still?: boolean }): React.JSX.Element {
    const [fullSize, setFullSize] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    // Stop rendering entirely while scrolled out of view
    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;
        const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
            rootMargin: "100px",
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative mb-8 flex w-full max-w-svw flex-col items-center justify-center transition-all",
                fullSize ? "h-[calc(100svh-6rem)]" : "h-[max(12rem,calc(100svh-36rem))]"
            )}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
        >
            <Canvas
                // Cap the pixel ratio: 3x phone screens otherwise render 9x the pixels for no visible gain
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                className="h-full w-full"
                // "demand" only re-renders on interaction, so a still ring costs nothing at rest
                frameloop={!isVisible ? "never" : still ? "demand" : "always"}
                aria-label="3D view of the sites in the ring"
            >
                <Scene members={members} still={still} />
            </Canvas>
            <div className="mt-2 flex max-h-fit w-full flex-col items-center justify-center">
                <Button
                    className="rounded-xl px-8 py-2 sm:px-6"
                    size="icon"
                    variant="outline"
                    onClick={() => setFullSize((value) => !value)}
                    aria-label={fullSize ? "Collapse 3D scene" : "Expand 3D scene"}
                    aria-expanded={fullSize}
                >
                    {fullSize ? <ChevronUp className="size-8" /> : <ChevronDown className="size-8" />}
                </Button>
            </div>
        </div>
    );
}
