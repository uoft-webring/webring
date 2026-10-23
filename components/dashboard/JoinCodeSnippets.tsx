"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { TAB_TRIGGER_CLASS } from "@/components/dashboard/Panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    LOGO_COLORS,
    LOGO_FORMATS,
    type LogoColor,
    type LogoFormat,
    type Snippet,
} from "@/lib/join-snippets";
import { cn } from "@/lib/cn";

/** `snippets` holds every format x colour combination, pre-highlighted on the server. */
export function JoinCodeSnippets({ snippets }: { snippets: Record<string, Snippet[]> }): React.JSX.Element {
    const [format, setFormat] = useState<LogoFormat>("SVG");
    const [color, setColor] = useState<LogoColor>("Blue");
    const variants = snippets[`${format}-${color}`];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <label className="text-muted-foreground text-sm" id="format-label">
                    Format:
                </label>
                <Select value={format} onValueChange={(v) => setFormat(v as LogoFormat)}>
                    <SelectTrigger aria-labelledby="format-label">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LOGO_FORMATS.map((f) => (
                            <SelectItem key={f} value={f}>
                                {f}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <label className="text-muted-foreground text-sm" id="color-label">
                    Color:
                </label>
                <Select value={color} onValueChange={(v) => setColor(v as LogoColor)}>
                    <SelectTrigger aria-labelledby="color-label">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(LOGO_COLORS).map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Same pill tabs as the profile editor; they wrap instead of scrolling on narrow screens */}
            <Tabs defaultValue={variants[0].label} className="w-full gap-4">
                <TabsList className="h-auto flex-wrap justify-start">
                    {variants.map(({ label }) => (
                        <TabsTrigger
                            className={cn("flex-none px-3 py-1.5", TAB_TRIGGER_CLASS)}
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
