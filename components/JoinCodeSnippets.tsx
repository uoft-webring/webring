"use client";

import { useState } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const formats = { SVG: "svg", PNG: "png" } as const;
type Format = keyof typeof formats;

const colors = {
    Blue: "ring_logo",
    Black: "ring_logo_black",
    White: "ring_logo_white",
} as const;
type Color = keyof typeof colors;

function buildSnippets(id: number, logoFile: string) {
    const html = `<div style="display: flex; align-items: center; gap: 8px">
    <a href='https://uoftwebring.com/redirect?nav=prev&id=${id}' aria-label='Previous site in UofT Webring'>←</a>
    <a href='https://uoftwebring.com' target='_blank'>
    <img
            src='https://uoftwebring.com/${logoFile}'
            alt='UofT Webring'
            style="width: 24px; height: auto"
        />
    </a>
    <a href='https://uoftwebring.com/redirect?nav=next&id=${id}' aria-label='Next site in UofT Webring'>→</a>
</div>`;

    const reactTailwind = `<div className="flex items-center gap-2">
    <a href='https://uoftwebring.com/redirect?nav=prev&id=${id}' aria-label='Previous site in UofT Webring'>←</a>
    <a href='https://uoftwebring.com' target='_blank'>
        <img
            src='https://uoftwebring.com/${logoFile}'
            alt='UofT Webring'
            className="w-6 h-auto"
        />
    </a>
    <a href='https://uoftwebring.com/redirect?nav=next&id=${id}' aria-label='Next site in UofT Webring'>→</a>
</div>`;

    return {
        "HTML & CSS": html,
        "React & Tailwind": reactTailwind,
    };
}

export default function JoinCodeSnippets({ id }: { id: number }) {
    const [format, setFormat] = useState<Format>("SVG");
    const [color, setColor] = useState<Color>("Blue");
    const logoFile = `${colors[color]}.${formats[format]}`;
    const codeStringMap = buildSnippets(id, logoFile);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <label className="text-muted-foreground text-sm" id="format-label">Format:</label>
                <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
                    <SelectTrigger aria-labelledby="format-label">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(formats).map((f) => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <label className="text-muted-foreground text-sm" id="color-label">Color:</label>
                <Select value={color} onValueChange={(v) => setColor(v as Color)}>
                    <SelectTrigger aria-labelledby="color-label">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(colors).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Tabs defaultValue="HTML & CSS" className="relative mr-auto flex w-full flex-col gap-6">
                <TabsList className="flex h-[10rem] w-full flex-row flex-wrap items-center rounded-none border-b bg-transparent p-0 sm:h-min">
                    {Object.keys(codeStringMap).map((value, index) => (
                        <TabsTrigger
                            className="text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground relative h-min border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold shadow-none transition-none focus-visible:ring-0 data-[state=active]:shadow-none"
                            key={index}
                            value={value}
                        >
                            {value}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {Object.entries(codeStringMap).map(([key, value], index) => (
                    <TabsContent key={index} value={key}>
                        <CodeSnippet codeString={value} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
