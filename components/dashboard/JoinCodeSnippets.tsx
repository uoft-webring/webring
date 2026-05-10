"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LOGO_COLORS, LOGO_FORMATS, type LogoColor, type LogoFormat, type Snippet } from "@/lib/join-snippets";

/** `snippets` holds every format x colour combination, pre-highlighted on the server. */
export function JoinCodeSnippets({ snippets }: { snippets: Record<string, Snippet[]> }): React.JSX.Element {
    const [format, setFormat] = useState<LogoFormat>("SVG");
    const [color, setColor] = useState<LogoColor>("Blue");
    const variants = snippets[`${format}-${color}`];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <label className="text-muted-foreground text-sm" id="format-label">Format:</label>
                <Select value={format} onValueChange={(v) => setFormat(v as LogoFormat)}>
                    <SelectTrigger aria-labelledby="format-label">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LOGO_FORMATS.map((f) => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <label className="text-muted-foreground text-sm" id="color-label">Color:</label>
                <Select value={color} onValueChange={(v) => setColor(v as LogoColor)}>
                    <SelectTrigger aria-labelledby="color-label">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(LOGO_COLORS).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Tabs defaultValue={variants[0].label} className="relative mr-auto flex w-full flex-col gap-6">
                <TabsList className="flex h-[10rem] w-full flex-row flex-wrap items-center rounded-none border-b bg-transparent p-0 sm:h-min">
                    {variants.map(({ label }) => (
                        <TabsTrigger
                            className="text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground relative h-min border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold shadow-none transition-none focus-visible:ring-0 data-[state=active]:shadow-none"
                            key={label}
                            value={label}
                        >
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {variants.map(({ label, code, html }) => (
                    <TabsContent key={label} value={label}>
                        <CodeBlock code={code} html={html} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
