"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { programs } from "@/utils/programs";

export default function ProgramInput({
    program,
    onProgramChange,
}: {
    program: string;
    onProgramChange: (program: string) => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(program);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="h-10">
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
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {programs.map((program) => (
                                <CommandItem
                                    key={program.value}
                                    value={program.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue);
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
