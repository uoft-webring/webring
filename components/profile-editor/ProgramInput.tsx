"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { programs } from "@/lib/data/programs";

export function ProgramInput({
    id,
    program,
    onProgramChange,
}: {
    id?: string;
    program: string;
    onProgramChange: (program: string) => void;
}): React.JSX.Element {
    // Controlled by the parent: `program` is the single source of truth
    const [open, setOpen] = useState(false);
    const value = program;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex h-10 flex-row justify-between rounded-md font-normal"
                >
                    {value
                        ? programs.find((program) => program.value === value)?.label
                        : "Select Programs..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command>
                    <CommandInput placeholder="Search Programs..." className="h-10" />
                    <CommandList>
                        <CommandEmpty>No program found.</CommandEmpty>
                        <CommandGroup>
                            {programs.map((program) => (
                                <CommandItem
                                    key={program.value}
                                    value={program.value}
                                    onSelect={(currentValue) => {
                                        onProgramChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    {program.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === program.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
