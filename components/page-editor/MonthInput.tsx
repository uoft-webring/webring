"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// Upcoming roles (an accepted offer) are allowed, so the list runs a year ahead
const NEWEST_YEAR = new Date().getFullYear() + 1;
const YEARS = Array.from({ length: NEWEST_YEAR - 1980 + 1 }, (_, index) => String(NEWEST_YEAR - index));

/**
 * A "YYYY-MM" month as two selects. Replaces <input type="month">, which Firefox and Safari render
 * as a plain text box. Half-picked values are kept as "YYYY-" or "-MM" so neither choice is lost;
 * validation rejects them until both are set.
 */
export function MonthInput({
    id,
    label,
    value,
    onChange,
    disabled,
    error,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: string;
}): React.JSX.Element {
    const [year = "", month = ""] = value.split("-");
    const errorId = error ? `${id}-error` : undefined;
    const set = (nextYear: string, nextMonth: string) =>
        onChange(nextYear || nextMonth ? `${nextYear}-${nextMonth}` : "");
    const triggerClass = cn("!h-10 w-full", error && "border-destructive");

    return (
        <>
            <div className="grid grid-cols-[3fr_2fr] gap-2">
                <Select value={month} onValueChange={(next) => set(year, next)} disabled={disabled}>
                    <SelectTrigger
                        id={id}
                        aria-label={`${label}: month`}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={errorId}
                        className={triggerClass}
                    >
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {MONTHS.map((name, index) => (
                            <SelectItem key={name} value={String(index + 1).padStart(2, "0")}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={year} onValueChange={(next) => set(next, month)} disabled={disabled}>
                    <SelectTrigger
                        aria-label={`${label}: year`}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={errorId}
                        className={triggerClass}
                    >
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {YEARS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {error && (
                <p id={errorId} role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </>
    );
}
