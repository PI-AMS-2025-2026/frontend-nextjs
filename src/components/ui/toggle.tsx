"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleProps {
    checked?: boolean
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
    className?: string
    label?: string
    showLabel?: boolean
}

function Toggle({
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    className,
    label,
    showLabel = false,
}: ToggleProps) {
    const [internalChecked, setInternalChecked] =
        React.useState(defaultChecked)

    const isChecked =
        checked !== undefined ? checked : internalChecked

    const handleChange = () => {
        if (disabled) return

        const nextValue = !isChecked

        if (checked === undefined) {
            setInternalChecked(nextValue)
        }

        onCheckedChange?.(nextValue)
    }

    return (
        <div className="flex items-center gap-3">
            {showLabel && label && (
                <span className="text-sm font-medium text-[#17264D]">
                    {label}
                </span>
            )}

            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                disabled={disabled}
                onClick={handleChange}
                className={cn(
                    "relative flex h-[24px] w-[44px] shrink-0 items-center rounded-full p-[3px] outline-none transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-[#4471E6]/40",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    isChecked
                        ? "bg-[#4471E6]"
                        : "bg-[#D9D9D9]",
                    className
                )}
            >
                <span
                    className={cn(
                        "block size-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
                        isChecked
                            ? "translate-x-[20px]"
                            : "translate-x-0"
                    )}
                />
            </button>
        </div>
    )
}

export { Toggle }