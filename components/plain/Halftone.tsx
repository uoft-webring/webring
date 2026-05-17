import { seededRandom } from "./seeded";

const ROWS = 14;
const ROW_HEIGHT = 22;
const WIDTH = 900;

type Block = { x: number; y: number; width: number; height: number; dense: boolean };

// Staggered rows of dotted blocks, generated once from a fixed seed so every render matches
function buildBlocks(): Block[] {
    const random = seededRandom(1827);
    const blocks: Block[] = [];
    for (let row = 0; row < ROWS; row++) {
        let x = random() * 60;
        while (x < WIDTH) {
            const width = 40 + random() * 160;
            if (random() > 0.32) {
                blocks.push({
                    x,
                    y: row * ROW_HEIGHT + 4,
                    width: Math.min(width, WIDTH - x),
                    height: ROW_HEIGHT - 4,
                    dense: random() > 0.55,
                });
            }
            x += width + 6 + random() * 40;
        }
    }
    return blocks;
}

const BLOCKS = buildBlocks();

/** Decorative dithered pattern in UofT navy. Purely visual. */
export function Halftone({ className }: { className?: string }): React.JSX.Element {
    return (
        <svg
            aria-hidden
            focusable="false"
            className={className}
            viewBox={`0 0 ${WIDTH} ${ROWS * ROW_HEIGHT}`}
            preserveAspectRatio="xMaxYMin slice"
        >
            <defs>
                <pattern id="plain-dots" width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="1.6" height="1.6" fill="#1E3765" />
                </pattern>
                <pattern id="plain-dots-dense" width="3" height="3" patternUnits="userSpaceOnUse">
                    <rect width="1.8" height="1.8" fill="#1E3765" />
                </pattern>
            </defs>
            {BLOCKS.map((block, index) => (
                <rect
                    key={index}
                    x={block.x}
                    y={block.y}
                    width={block.width}
                    height={block.height}
                    fill={block.dense ? "url(#plain-dots-dense)" : "url(#plain-dots)"}
                    opacity={block.dense ? 0.42 : 0.3}
                />
            ))}
        </svg>
    );
}
