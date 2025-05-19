import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
    error,
    className,
    type,
    ...props
}: { error?: string } & React.ComponentProps<"input">) {
    return (
        <>
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-destructive" // Add error border color className
                )}
                {...props}
            />
            {error && <p className="text-destructive">{error}</p>}
        </>
        // <input
        //   type={type}
        //   data-slot="input"
        //   className={cn(
        //     "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        //     "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        //     "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        //     className
        //   )}
        //   {...props}
        // />
    );
}

Input.displayName = "Input";

export { Input };

/* import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
extends React.InputHTMLAttributes {
error?: string; // Add error property
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
({ className, type, error, ...props }, ref) => { // Destructure error
return (

<input
type={type}
className={cn(
"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
error && "border-red-500", // Add error border color
className
)}
ref={ref}
{...props}
/>
{error &&

{error}
} 

)
}
)
Input.displayName = "Input"

export { Input }
 */
