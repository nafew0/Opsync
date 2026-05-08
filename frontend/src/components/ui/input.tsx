'use client'
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[10px] border border-[color:var(--ops-ink-200)] bg-white px-3 py-2 text-[13px] text-[color:var(--ops-ink-900)] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[color:var(--ops-ink-400)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ops-primary-200)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
