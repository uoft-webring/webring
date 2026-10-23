"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { seededRandom } from "./seeded";
import type { PlainMember } from "./types";

const WIDTH = 1000;
const HEIGHT = 800;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

type Node = PlainMember & { x: number; y: number };

// Members sit on a jittered ellipse in ring order, so prev/next edges trace the actual ring.
// Seeded by ringId: a member keeps their spot when others join or leave.
function layout(members: PlainMember[]): Node[] {
    const step = (2 * Math.PI) / Math.max(members.length, 1);
    return members.map((member, index) => {
        const random = seededRandom(member.ringId * 7919 + 17);
        const angle = index * step - Math.PI / 2 + (random() - 0.5) * step * 0.7;
        const radius = 0.72 + random() * 0.32;
        return {
            ...member,
            x: CENTER_X + Math.cos(angle) * 340 * radius,
            y: CENTER_Y + Math.sin(angle) * 290 * radius,
        };
    });
}

// Same guard as the 3D ring: only ever hand window.open an http(s) URL
function openMemberSite(domain: string): void {
    try {
        if (["http:", "https:"].includes(new URL(domain).protocol)) {
            window.open(domain, "_blank", "noopener,noreferrer");
        }
    } catch {
        // malformed legacy value: ignore the click
    }
}

/**
 * Lightweight 2D map of the ring: plain SVG, no animation loop. The table next to it is the
 * accessible version, so the graph is a single labelled image to assistive tech.
 */
export function RingGraph({
    members,
    matches,
}: {
    members: PlainMember[];
    matches: (member: PlainMember) => boolean;
}): React.JSX.Element {
    const [hovered, setHovered] = useState<number | null>(null);
    const nodes = layout(members);
    const isNeighbour = (index: number) => {
        if (hovered === null) return false;
        const hoveredIndex = nodes.findIndex((node) => node.ringId === hovered);
        const count = nodes.length;
        return index === (hoveredIndex + 1) % count || index === (hoveredIndex - 1 + count) % count;
    };

    return (
        <div className="relative overflow-hidden border border-[#b9c4d6] bg-[#e9eef6]">
            <svg
                role="img"
                aria-label={`Map of the ${members.length} sites in the ring. The list of sites is the accessible version.`}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="block h-auto w-full"
                onPointerLeave={() => setHovered(null)}
            >
                {nodes.map((node, index) => {
                    const next = nodes[(index + 1) % nodes.length];
                    if (nodes.length < 2) return null;
                    const lit = hovered === node.ringId || hovered === next.ringId;
                    return (
                        <line
                            key={`edge-${node.ringId}`}
                            x1={node.x}
                            y1={node.y}
                            x2={next.x}
                            y2={next.y}
                            stroke={lit ? "#1E3765" : "#c3cddd"}
                            strokeWidth={lit ? 2.5 : 1.2}
                        />
                    );
                })}
                {nodes.map((node, index) => {
                    const active = hovered === node.ringId;
                    const visible = matches(node);
                    return (
                        <g
                            key={node.ringId}
                            className={cn(
                                "transition-opacity duration-150 motion-reduce:transition-none",
                                visible ? "cursor-pointer" : "pointer-events-none"
                            )}
                            opacity={visible ? 1 : 0.15}
                            onPointerEnter={() => setHovered(node.ringId)}
                            onClick={() => openMemberSite(node.domain)}
                        >
                            {/* Larger invisible target makes small nodes easy to hit */}
                            <circle cx={node.x} cy={node.y} r={18} fill="transparent" />
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={active ? 10 : 8}
                                fill={active ? "#1E3765" : isNeighbour(index) ? "#4f6896" : "#98a5bc"}
                            />
                            <text
                                x={node.x + 14}
                                y={node.y + 5}
                                fontSize={15}
                                fill={active ? "#1E3765" : "#52617d"}
                                className="font-[family-name:var(--font-plain-mono)]"
                            >
                                {node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="absolute bottom-2 left-2 bg-[#1E3765]/85 px-2.5 py-1 font-[family-name:var(--font-plain-mono)] text-xs text-white italic">
                Sites: {members.length}
            </div>
        </div>
    );
}
