import { useId } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Radix Select can't use "" as an item value, so "any" needs a sentinel
const ANY = "__any__";

export function Filter({
    label = "Filter",
    options,
    value,
    onChange,
}: {
    label?: string;
    options: string[];
    value: string | null;
    onChange: (val: string | null) => void;
}): React.JSX.Element {
    const labelId = useId();
    return (
        <div className="flex h-full flex-col gap-1">
            <span className="text-muted-foreground text-sm" id={labelId}>
                {label}
            </span>
            <Select value={value ?? ANY} onValueChange={(val) => onChange(val === ANY ? null : val)}>
                <SelectTrigger className="bg-card !h-10 w-full rounded-xl" aria-labelledby={labelId}>
                    <SelectValue placeholder="(Any)" />
                </SelectTrigger>

                <SelectContent className="text-md bg-card rounded-xl">
                    <SelectItem value={ANY}>(Any)</SelectItem>
                    {options.map((opt) => (
                        <SelectItem key={opt} value={opt} className="hover:bg-accent rounded-xl px-2">
                            {opt}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
