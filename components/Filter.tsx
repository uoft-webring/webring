import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function Filter({
    label = "Filter",
    options,
    value,
    onChange,
}: {
    label?: string;
    options: string[];
    value: string | null;
    onChange: (val: string | null) => void;
}) {
    const ANY = "__any__";

    return (
        <div className="flex flex-col gap-1 h-full">
            <span className="text-sm text-muted-foreground">{label}</span>
            <Select value={value ?? ANY} onValueChange={(val) => onChange(val === ANY ? null : val)}>
                <SelectTrigger className="bg-card rounded-xl w-full !h-10">
                    <SelectValue placeholder="(Any)" />
                </SelectTrigger>

                <SelectContent className="text-md rounded-xl bg-card">
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
